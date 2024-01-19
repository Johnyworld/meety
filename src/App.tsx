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
      <hr />
      <Members />
      <hr />
      <Messages />
      <hr />
      <MessageInput />
    </main>
  );
}

const Members = () => {
  const { members } = useAgoraRTMContext();
  return (
    <ul>
      {members.map(member => (
        <li key={member.uid}>{member.displayName}</li>
      ))}
    </ul>
  );
};

const Messages = () => {
  const { messages } = useAgoraRTMContext();
  return messages.map((message, i) =>
    message.type === 'chat' ? (
      <p key={i}>
        {/* TODO: key를 적당한 아이디값으로 변경 */}
        <strong>{message.displayName}</strong>: {message.message}
      </p>
    ) : (
      <p key={i}>
        {/* TODO: key를 적당한 아이디값으로 변경 */}
        <strong>🤖 Bot</strong>: {message.message}
      </p>
    )
  );
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
