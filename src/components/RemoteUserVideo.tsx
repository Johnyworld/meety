import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { useEffect, useRef } from 'react';

interface Props {
  user: IAgoraRTCRemoteUser;
}

export const RemoteUserVideo = ({ user }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      user.videoTrack?.play(divRef.current);
    }
  }, [user.audioTrack, user.hasAudio, user.hasVideo, user.videoTrack]);

  return <div ref={divRef} className='h-20 w-32' />;
};
