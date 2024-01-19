import { useEffect, useState } from 'react';
import { LocalUserVideo } from './components/LocalUserVideo';
import { RemoteUserVideo } from './components/RemoteUserVideo';
import { useAgoraRTCContext } from './hooks/useAgoraRTCContext';
import { useAgoraRTMContext } from './hooks/useAgoraRTMContext';

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
      <Messages />
      <MessageInput />
    </main>
  );
}

const Messages = () => {
  const { messages } = useAgoraRTMContext();
  return messages.map(message => (
    <p>
      <strong>{message.displayName}</strong>: {message.message}
    </p>
  ));
};

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useAgoraRTMContext();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!message) {
          return;
        }
        sendMessage(message);
        setMessage('');
      }}
    >
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button type='submit'>보내기</button>
    </form>
  );
};

export default App;
