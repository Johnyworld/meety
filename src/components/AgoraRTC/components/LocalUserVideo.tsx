import { ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { useEffect, useRef } from 'react';

interface Props {
  localVideoTrack: ILocalVideoTrack;
}

export const LocalUserVideo = ({ localVideoTrack }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = '';
      localVideoTrack.play(divRef.current, { fit: 'cover' });
    }
  }, [localVideoTrack]);

  return <div ref={divRef} className='h-20 w-32' />;
};
