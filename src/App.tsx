import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useEffect, useMemo, useState } from 'react';
import { LocalUserVideo } from './components/LocalUserVideo';
import { useLocalTracks } from './hooks/useLocalTracks';

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

  const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);

  useEffect(() => {
    if (!client) {
      return;
    }
    const main = async () => {
      await client.join(APP_ID, roomId, token, uid);

      if (localVideoTrack && localVideoTrack) {
        client.publish([localAudioTrack, localVideoTrack]);
      }
    };

    main();
  }, [client, localAudioTrack, localVideoTrack]);

  return (
    <main>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      {localVideoTrack && <LocalUserVideo localVideoTrack={localVideoTrack} />}
    </main>
  );
}

export default App;
