import {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IDataChannelConfig,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';

export interface AgoraRTCContextType {
  client: IAgoraRTCClient;
  remoteUsers: IAgoraRTCRemoteUser[];
  localAudioTrack: ILocalAudioTrack | null;
  localVideoTrack: ILocalVideoTrack | null;
  localScreenTrack: ILocalVideoTrack | null;
  isScreenSharing: boolean;
  micMuted: boolean;
  cameraMuted: boolean;
  publishStream: () => void;
  toggleScreen: () => void;
  toggleMuteMic: () => void;
  toggleMuteCamera: () => void;
}

export type AgoraClientEventListener = (
  user: IAgoraRTCRemoteUser,
  mediaType: 'audio' | 'video' | 'datachannel',
  config?: IDataChannelConfig | undefined
) => void;
