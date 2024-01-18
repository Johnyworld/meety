import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IDataChannelConfig,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';
import { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalTracks } from '../hooks/useLocalTracks';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const roomId = 'main';
const token = null;

type AgoraClientEventListener = (
  user: IAgoraRTCRemoteUser,
  mediaType: 'audio' | 'video' | 'datachannel',
  config?: IDataChannelConfig | undefined
) => void;

let uid = sessionStorage.getItem('uid');
if (!uid) {
  uid = String(Math.floor(Math.random() * 10000));
  sessionStorage.setItem('uid', uid);
}

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

  const [isJoined, setIsJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localAudioTrack, localVideoTrack] = useLocalTracks();
  const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null);

  const joinStream = useCallback(async () => {
    await client.join(APP_ID, roomId, token, uid);
    setIsJoined(true);
  }, [client]);

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
      setRemoteUsers([...remoteUsers, user]);
    },
    [client, remoteUsers]
  );

  const handleUserUnpublished: AgoraClientEventListener = useCallback(
    async (user, mediaType) => {
      console.log('=== USER UN-PUBLISHED');
      await client.unsubscribe(user, mediaType);
      setRemoteUsers(remoteUsers.filter(remoteUser => remoteUser.uid !== user.uid));
    },
    [client, remoteUsers]
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
