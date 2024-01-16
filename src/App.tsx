import AgoraRTC, { IAgoraRTCRemoteUser, IDataChannelConfig } from 'agora-rtc-sdk-ng';
import { useEffect, useMemo, useState } from 'react';
import { LocalUserVideo } from './components/LocalUserVideo';
import { useLocalTracks } from './hooks/useLocalTracks';
import { RemoteUserVideo } from './components/RemoteUserVideo';

type AgoraClientEventListener = (
  user: IAgoraRTCRemoteUser,
  mediaType: 'audio' | 'video' | 'datachannel',
  config?: IDataChannelConfig | undefined
) => void;

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const roomId = 'main';
const token = null;

let uid = sessionStorage.getItem('uid');
if (!uid) {
  uid = String(Math.floor(Math.random() * 10000));
  sessionStorage.setItem('uid', uid);
}

function App() {
  const [localAudioTrack, localVideoTrack] = useLocalTracks();

  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const [isJoined, setIsJoined] = useState(false);

  const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);

  useEffect(() => {
    const join = async () => {
      await client.join(APP_ID, roomId, token, uid);
      setIsJoined(true);
    };
    join();
  }, [client]);

  useEffect(() => {
    const handleUserPublished: AgoraClientEventListener = async (user, mediaType) => {
      console.log('=== USER PUBLISHED');
      await client.subscribe(user, mediaType);
      setRemoteUsers([...remoteUsers, user]);
    };
    const handleUserUnpublished: AgoraClientEventListener = async (user, mediaType) => {
      console.log('=== USER UN-PUBLISHED');
      await client.unsubscribe(user, mediaType);
      setRemoteUsers(remoteUsers.filter(remoteUser => remoteUser.uid !== user.uid));
    };
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
    };
  }, [client, remoteUsers]);

  useEffect(() => {
    if (!isJoined) {
      return;
    }
    const main = async () => {
      if (localAudioTrack && localVideoTrack) {
        client.publish([localAudioTrack, localVideoTrack]);
      }
    };
    main();
  }, [client, isJoined, localAudioTrack, localVideoTrack, remoteUsers]);

  return (
    <main>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      {localVideoTrack && <LocalUserVideo localVideoTrack={localVideoTrack} />}
      {remoteUsers.map(user => (
        <RemoteUserVideo key={user.uid} user={user} />
      ))}
    </main>
  );
}

export default App;
