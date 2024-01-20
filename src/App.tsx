import { useEffect, useState } from 'react';
import { useAgoraRTMContext } from './hooks/useAgoraRTMContext';
import { useAgoraRTCContext } from './components/AgoraRTC/context/useContext';
import { AgoraRTC } from './components/AgoraRTC';

function App() {
  const {
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    publishStream,
    localScreenTrack,
    micMuted,
    cameraMuted,
    toggleScreen,
    toggleMuteMic,
    toggleMuteCamera,
  } = useAgoraRTCContext();

  useEffect(() => {
    publishStream();
  }, [publishStream]);

  return (
    <main>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      {localVideoTrack && (
        <AgoraRTC.LocalUserVideo localVideoTrack={localScreenTrack ? localScreenTrack : localVideoTrack} />
      )}
      {remoteUsers.map(user => (
        <AgoraRTC.RemoteUserVideo key={user.uid} user={user} />
      ))}
      <button onClick={toggleScreen}>toggleScreen</button>
      {` | `}
      {localAudioTrack && <button onClick={toggleMuteMic}>toggleMic: {micMuted ? '❌' : '🎙'}</button>}
      {` | `}
      {localVideoTrack && <button onClick={toggleMuteCamera}>toggleCamera: {cameraMuted ? '❌' : '🎥'}</button>}
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
