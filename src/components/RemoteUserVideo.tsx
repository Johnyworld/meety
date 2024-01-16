import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useEffect, useRef } from 'react';

interface Props {
  user: IAgoraRTCRemoteUser;
}

export const RemoteUserVideo = ({ user }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      if (user.hasVideo) {
        user.videoTrack?.play(divRef.current);
      }
      if (user.hasAudio) {
        user.audioTrack?.play();
      }
    }
  }, [user.audioTrack, user.hasAudio, user.hasVideo, user.videoTrack]);

  return <div ref={divRef} className='h-20 w-32' />;
};
