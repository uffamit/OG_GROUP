'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
} from 'agora-rtc-sdk-ng';

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

interface VideoCallProps {
  channelName: string;
  appointmentId: string;
}

export default function VideoCall({ channelName, appointmentId }: VideoCallProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Agora client
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(agoraClient);

    // Event listeners
    const handleUserPublished = async (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await agoraClient.subscribe(remoteUser, mediaType);
      
      if (mediaType === 'audio') {
        remoteUser.audioTrack?.play();
      }
      
      if (mediaType === 'video') {
        // Play remote video in a container
        const remoteVideoContainer = document.getElementById(`remote-video-${remoteUser.uid}`);
        if (remoteVideoContainer) {
          remoteUser.videoTrack?.play(remoteVideoContainer);
        }
      }

      setRemoteUsers(prev => {
        const exists = prev.find(u => u.uid === remoteUser.uid);
        if (exists) return prev;
        return [...prev, remoteUser];
      });
    };

    const handleUserUnpublished = (remoteUser: IAgoraRTCRemoteUser) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
    };

    const handleUserLeft = (remoteUser: IAgoraRTCRemoteUser) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
    };

    agoraClient.on('user-published', handleUserPublished);
    agoraClient.on('user-unpublished', handleUserUnpublished);
    agoraClient.on('user-left', handleUserLeft);

    return () => {
      agoraClient.off('user-published', handleUserPublished);
      agoraClient.off('user-unpublished', handleUserUnpublished);
      agoraClient.off('user-left', handleUserLeft);
    };
  }, []);

  const join = async () => {
    if (!client || !user) {
      toast({ 
        title: 'Error', 
        description: 'Client not initialized or user not logged in.', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      // Fetch RTC token
      const tokenRes = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          channelName, 
          uid: parseInt(user.uid.substring(0, 8), 36) % 1000000 // Convert uid to number
        }),
      });
      const { rtcToken } = await tokenRes.json();

      if (!rtcToken) {
        throw new Error('Failed to fetch RTC token');
      }

      // Join channel
      const uid = await client.join(
        AGORA_APP_ID, 
        channelName, 
        rtcToken, 
        parseInt(user.uid.substring(0, 8), 36) % 1000000
      );

      // Create and publish local tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      await client.publish([audioTrack, videoTrack]);
      
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // Play local video
      videoTrack.play('local-video');

      setIsJoined(true);

      // Start AI agent
      const agentRes = await fetch('/api/agora/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, rtcToken }),
      });
      
      const agentData = await agentRes.json();
      if (agentData.agent_id) {
        setAgentId(agentData.agent_id);
        toast({ 
          title: 'AI Assistant Joined', 
          description: 'The AI medical assistant has joined the call.' 
        });
      }
    } catch (error) {
      console.error('Failed to join call:', error);
      toast({ 
        title: 'Connection Failed', 
        description: error instanceof Error ? error.message : 'Could not connect to call.', 
        variant: 'destructive' 
      });
    }
  };

  const leave = async () => {
    if (!client) return;

    try {
      // Stop AI agent
      if (agentId) {
        await fetch('/api/agora/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId }),
        });
      }

      // Clean up local tracks
      localAudioTrack?.close();
      localVideoTrack?.close();
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);

      // Leave channel
      await client.leave();
      
      setIsJoined(false);
      setRemoteUsers([]);
      
      toast({ title: 'Call Ended', description: 'You have left the call.' });
      
      // Navigate back to dashboard
      router.push('/patient/dashboard');
    } catch (error) {
      console.error('Failed to leave call:', error);
      toast({ 
        title: 'Error', 
        description: 'Could not leave call properly.', 
        variant: 'destructive' 
      });
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Auto-join on mount
  useEffect(() => {
    if (client && user && !isJoined) {
      join();
    }
  }, [client, user]);

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0 relative h-full">
            <div id="local-video" className="w-full h-full min-h-[300px] bg-gray-800 rounded-lg" />
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
              You
            </div>
          </CardContent>
        </Card>

        {/* Remote Video(s) - AI Agent and others */}
        {remoteUsers.map((user) => (
          <Card key={user.uid} className="bg-gray-900 border-gray-700">
            <CardContent className="p-0 relative h-full">
              <div 
                id={`remote-video-${user.uid}`} 
                className="w-full h-full min-h-[300px] bg-gray-800 rounded-lg" 
              />
              <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
                {user.uid === 0 ? 'AI Medical Assistant' : `User ${user.uid}`}
              </div>
            </CardContent>
          </Card>
        ))}

        {remoteUsers.length === 0 && isJoined && (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-0 flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-gray-400">
                <p>Waiting for AI assistant to join...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6 flex justify-center gap-4">
        <Button
          size="lg"
          variant={isAudioMuted ? 'destructive' : 'secondary'}
          onClick={toggleAudio}
          disabled={!isJoined}
          className="rounded-full w-14 h-14"
        >
          {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        
        <Button
          size="lg"
          variant={isVideoMuted ? 'destructive' : 'secondary'}
          onClick={toggleVideo}
          disabled={!isJoined}
          className="rounded-full w-14 h-14"
        >
          {isVideoMuted ? <VideoOff className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
        </Button>
        
        <Button
          size="lg"
          variant="destructive"
          onClick={leave}
          disabled={!isJoined}
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
