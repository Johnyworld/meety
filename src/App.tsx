import { useEffect } from 'react';
import { LocalUserVideo } from './components/LocalUserVideo';
import { RemoteUserVideo } from './components/RemoteUserVideo';
import { useAgoraRTCContext } from './hooks/useAgoraRTCContext';

function App() {
  const { localVideoTrack, remoteUsers, publishStream } = useAgoraRTCContext();

  useEffect(() => {
    publishStream();
  }, [publishStream]);

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
