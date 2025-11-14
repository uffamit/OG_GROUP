'use client';

import { useState, useEffect, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  UID,
} from 'agora-rtc-sdk-ng';
import { useToast } from './use-toast';

// This should be in a config file, but for simplicity it's here.
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

interface CallSummary {
  transcript: string;
}

export const useAgora = (channelName: string, userId: UID | null) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize client
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(agoraClient);

    // Event listeners for remote users
    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      // No need to do anything specific here for the AI agent
    };

    agoraClient.on('user-published', handleUserPublished);
    agoraClient.on('user-unpublished', handleUserUnpublished);

    return () => {
      agoraClient.off('user-published', handleUserPublished);
      agoraClient.off('user-unpublished', handleUserUnpublished);
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      agoraClient.leave();
    };
  }, [localAudioTrack]);

  const join = useCallback(async () => {
    if (!client || !userId) {
      toast({ title: 'Error', description: 'Agora client not initialized or user not logged in.', variant: 'destructive' });
      return;
    }

    try {
      // Fetch RTC token
      const tokenRes = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid: userId }),
      });
      const { rtcToken } = await tokenRes.json();

      if (!rtcToken) {
        throw new Error('Failed to fetch RTC token');
      }

      // Join channel
      await client.join(AGORA_APP_ID, channelName, rtcToken, userId);

      // Create and publish microphone audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish(audioTrack);
      setLocalAudioTrack(audioTrack);

      // Start AI agent
      const agentRes = await fetch('/api/agora/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, rtcToken }),
      });
      const agentData = await agentRes.json();
      if (agentData.agent_id) {
        setAgentId(agentData.agent_id);
        setIsConnected(true);
        toast({ title: 'Success', description: 'Voice assistant connected.' });
      } else {
        throw new Error(agentData.error || 'Failed to start AI agent');
      }
    } catch (error) {
      console.error('Failed to join channel or start agent:', error);
      toast({ title: 'Connection Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.', variant: 'destructive' });
      setIsConnected(false);
    }
  }, [client, channelName, userId, toast]);

  const leave = useCallback(async () => {
    if (!client || !agentId) return;

    try {
      // Stop AI agent and fetch transcript
      const stopRes = await fetch('/api/agora/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      
      const stopData = await stopRes.json();
      
      // If transcript is available, set it for summary
      if (stopData.transcript) {
        setCallSummary({ transcript: stopData.transcript });
      }

      // Clean up local tracks and leave channel
      localAudioTrack?.close();
      setLocalAudioTrack(null);
      await client.leave();
      
      setIsConnected(false);
      setAgentId(null);
      toast({ title: 'Disconnected', description: 'Voice assistant has been disconnected.' });
    } catch (error) {
      console.error('Failed to leave channel or stop agent:', error);
      toast({ title: 'Disconnection Failed', description: 'Could not disconnect properly.', variant: 'destructive' });
    }
  }, [client, agentId, localAudioTrack, toast]);

  const clearSummary = useCallback(() => {
    setCallSummary(null);
  }, []);

  return { isConnected, join, leave, callSummary, clearSummary };
};
