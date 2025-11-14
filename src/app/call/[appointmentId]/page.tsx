'use client';
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

interface CallPageProps {
  params: Promise<{ appointmentId: string }>;
}

export default function CallPage({ params }: CallPageProps) {
  const resolvedParams = use(params);
  const { appointmentId } = resolvedParams;
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const [client] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
  );
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channelName = `call-${appointmentId}`;

    const handleUserPublished = async (remoteUser: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await client.subscribe(remoteUser, mediaType);
      
      if (mediaType === 'video') {
        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === remoteUser.uid);
          if (!exists) {
            return [...prev, remoteUser];
          }
          return prev;
        });
      }
      
      if (mediaType === 'audio') {
        remoteUser.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (remoteUser: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);

    // Join the call automatically
    joinCall(channelName);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      leaveCall();
    };
  }, [appointmentId]);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteUsers.length > 0 && remoteVideoRef.current) {
      const remoteUser = remoteUsers[0];
      if (remoteUser.videoTrack) {
        remoteUser.videoTrack.play(remoteVideoRef.current);
      }
    }
  }, [remoteUsers]);

  const joinCall = async (channelName: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to join a call.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get token
      const tokenRes = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid: user.uid }),
      });
      const { rtcToken } = await tokenRes.json();

      if (!rtcToken) {
        throw new Error('Failed to get token');
      }

      // Join channel
      await client.join(AGORA_APP_ID, channelName, rtcToken, user.uid);

      // Create and publish tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      await client.publish([audioTrack, videoTrack]);

      setIsJoined(true);
      toast({
        title: 'Joined Call',
        description: 'You are now in the video call',
      });

      // Start AI bot
      try {
        const agentRes = await fetch('/api/agora/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName, rtcToken }),
        });
        const agentData = await agentRes.json();
        if (agentData.agent_id) {
          setAgentId(agentData.agent_id);
        }
      } catch (error) {
        console.error('Failed to start AI bot:', error);
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast({
        title: 'Failed to Join Call',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const leaveCall = async () => {
    try {
      // Stop AI agent if running
      if (agentId) {
        await fetch('/api/agora/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId }),
        });
      }

      localAudioTrack?.close();
      localVideoTrack?.close();
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);

      await client.leave();
      setIsJoined(false);
      
      router.push('/patient/dashboard');
    } catch (error) {
      console.error('Error leaving call:', error);
      router.push('/patient/dashboard');
    }
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Video Call - Appointment {appointmentId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remote video */}
              <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
                <div ref={remoteVideoRef} className="w-full h-full" />
                {remoteUsers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">Waiting for other participants...</p>
                  </div>
                )}
              </div>

              {/* Local video */}
              <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
                <div ref={localVideoRef} className="w-full h-full" />
                {!localVideoTrack && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">Your video</p>
                  </div>
                )}
              </div>
            </div>

            {/* Call controls */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                size="lg"
                variant={isMuted ? 'destructive' : 'secondary'}
                onClick={toggleMute}
                disabled={!isJoined}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                size="lg"
                variant={isVideoOff ? 'destructive' : 'secondary'}
                onClick={toggleVideo}
                disabled={!isJoined}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              <Button size="lg" variant="destructive" onClick={leaveCall}>
                <PhoneOff className="h-5 w-5 mr-2" />
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
