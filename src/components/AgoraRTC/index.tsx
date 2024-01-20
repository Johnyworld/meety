import { LocalUserVideo } from './components/LocalUserVideo';
import { RemoteUserVideo } from './components/RemoteUserVideo';
import { AgoraRTCContextProvider } from './context/provider';

export const AgoraRTC = {
  Provider: AgoraRTCContextProvider,
  LocalUserVideo: LocalUserVideo,
  RemoteUserVideo: RemoteUserVideo,
};
