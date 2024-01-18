import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IDataChannelConfig,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';
import { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalTracks } from '../hooks/useLocalTracks';
import { userStore } from '../stores/userStore';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const roomId = 'main';
const token = null;

type AgoraClientEventListener = (
  user: IAgoraRTCRemoteUser,
  mediaType: 'audio' | 'video' | 'datachannel',
  config?: IDataChannelConfig | undefined
) => void;

interface Props {
  children: ReactNode;
}

interface AgoraRTCContextType {
  client: IAgoraRTCClient;
  remoteUsers: IAgoraRTCRemoteUser[];
  localAudioTrack: ILocalAudioTrack | null;
  localVideoTrack: ILocalVideoTrack | null;
  localScreenTrack: ILocalVideoTrack | null;
  publishStream: () => void;
  toggleScreen: () => void;
}

export const AgoraRTCContext = createContext<AgoraRTCContextType>({} as AgoraRTCContextType);

export const AgoraRTCContextProvider = ({ children }: Props) => {
  const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);
  const uid = userStore(state => state.uid);

  const [isJoined, setIsJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localAudioTrack, localVideoTrack] = useLocalTracks();
  const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null);

  const joinStream = useCallback(async () => {
    await client.join(APP_ID, roomId, token, uid);
    setIsJoined(true);
  }, [client, uid]);

  const publishStream = useCallback(async () => {
    if (localAudioTrack && localVideoTrack) {
      client.publish([localAudioTrack, localVideoTrack]);
    }
  }, [client, localAudioTrack, localVideoTrack]);

  const toggleScreen = useCallback(async () => {
    if (!localAudioTrack || !localVideoTrack) {
      return;
    }
    if (!localScreenTrack) {
      const localScreenTracks = await AgoraRTC.createScreenVideoTrack({});
      setLocalScreenTrack(Array.isArray(localScreenTracks) ? localScreenTracks[0] : localScreenTracks);
      await client.unpublish([localVideoTrack]);
      await client.publish(localScreenTracks);
    } else {
      setLocalScreenTrack(null);
      await client.unpublish(localScreenTrack);
      await client.publish([localVideoTrack]);
    }
  }, [client, localAudioTrack, localScreenTrack, localVideoTrack]);

  const handleUserPublished: AgoraClientEventListener = useCallback(
    async (user, mediaType) => {
      console.log('=== USER PUBLISHED');
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        setRemoteUsers(state => [...state, user]);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    },
    [client]
  );

  const handleUserUnpublished: AgoraClientEventListener = useCallback(
    async (user, mediaType) => {
      console.log('=== USER UN-PUBLISHED');
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
      await client.unsubscribe(user, mediaType);
      setRemoteUsers(state => state.filter(remoteUser => remoteUser.uid !== user.uid));
    },
    [client]
  );

  useEffect(() => {
    if (isJoined) {
      return;
    }
    joinStream();
  }, [isJoined, joinStream]);

  useEffect(() => {
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
    };
  }, [client, handleUserPublished, handleUserUnpublished, remoteUsers]);

  if (!isJoined || !localAudioTrack || !localVideoTrack) {
    return null;
  }

  return (
    <AgoraRTCContext.Provider
      value={{
        client,
        remoteUsers,
        publishStream,
        localAudioTrack,
        localVideoTrack,
        localScreenTrack,
        toggleScreen,
      }}
    >
      {children}
    </AgoraRTCContext.Provider>
  );
};
