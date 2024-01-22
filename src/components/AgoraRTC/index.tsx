import { ReactNode, useEffect, useRef } from 'react';
import { AgoraRTCContextProvider } from './context/provider';
import { useAgoraRTCContext } from './context/useContext';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

interface TriggerProps {
  trigger?: ((muted: boolean) => ReactNode) | ReactNode;
}

const LocalUserVideo = () => {
  const { localVideoTrack, localScreenTrack, isScreenSharing } = useAgoraRTCContext();
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = '';
      if (isScreenSharing) {
        localScreenTrack?.play(divRef.current, { fit: 'cover' });
      } else {
        localVideoTrack?.play(divRef.current, { fit: 'cover' });
      }
    }
  }, [isScreenSharing, localScreenTrack, localVideoTrack]);
  return <div ref={divRef} className='h-20 w-32' />;
};

const RemoteUsersVideos = () => {
  const { remoteUsers } = useAgoraRTCContext();
  return (
    <ul>
      {remoteUsers.map(user => (
        <li key={user.uid}>
          <RemoteUserVideo user={user} />
        </li>
      ))}
    </ul>
  );
};

const RemoteUserVideo = ({ user }: { user: IAgoraRTCRemoteUser }) => {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (divRef.current) {
      user.videoTrack?.play(divRef.current);
    }
  }, [user.audioTrack, user.hasAudio, user.hasVideo, user.videoTrack]);
  return <div ref={divRef} className='h-20 w-32' />;
};

const ToggleMic = ({ trigger }: TriggerProps) => {
  const { micMuted, toggleMuteMic } = useAgoraRTCContext();
  return (
    <button onClick={toggleMuteMic}>
      {!trigger ? `toggleMic: ${micMuted ? '❌' : '🎙'}` : typeof trigger === 'function' ? trigger(micMuted) : trigger}
    </button>
  );
};

const ToggleCamera = ({ trigger }: TriggerProps) => {
  const { cameraMuted, toggleMuteCamera } = useAgoraRTCContext();
  return (
    <button onClick={toggleMuteCamera}>
      {!trigger
        ? `toggleCamera: ${cameraMuted ? '❌' : '🎥'}`
        : typeof trigger === 'function'
        ? trigger(cameraMuted)
        : trigger}
    </button>
  );
};

const ToggleScreen = ({ trigger }: TriggerProps) => {
  const { isScreenSharing, toggleScreen } = useAgoraRTCContext();
  return (
    <button onClick={toggleScreen}>
      {!trigger ? 'toggleScreen' : typeof trigger === 'function' ? trigger(isScreenSharing) : trigger}
    </button>
  );
};

export const AgoraRTC = Object.assign(
  {},
  {
    Provider: AgoraRTCContextProvider,
    LocalUserVideo,
    RemoteUsersVideos,
    ToggleMic,
    ToggleCamera,
    ToggleScreen,
  }
);
