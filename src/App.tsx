import { useEffect } from 'react';
import { LocalUserVideo } from './components/LocalUserVideo';
import { RemoteUserVideo } from './components/RemoteUserVideo';
import { useAgoraRTCContext } from './hooks/useAgoraRTCContext';

function App() {
  const { localVideoTrack, remoteUsers, publishStream, localScreenTrack, toggleScreen } = useAgoraRTCContext();

  useEffect(() => {
    publishStream();
  }, [publishStream]);

  return (
    <main>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      {localVideoTrack && <LocalUserVideo localVideoTrack={localScreenTrack ? localScreenTrack : localVideoTrack} />}
      {remoteUsers.map(user => (
        <RemoteUserVideo key={user.uid} user={user} />
      ))}
      <button onClick={toggleScreen}>toggleScreen</button>
    </main>
  );
}

export default App;
