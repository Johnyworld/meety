import AgoraRTC, { ILocalAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { useEffect, useState } from 'react';

export const useLocalTracks = () => {
  const [tracks, setTracks] = useState<[ILocalAudioTrack, ILocalVideoTrack] | [null, null]>([null, null]);

  useEffect(() => {
    const getTracks = async () => {
      const [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        {
          encoderConfig: {
            width: { min: 640, ideal: 1920, max: 1920 },
            height: { min: 480, ideal: 1080, max: 1080 },
          },
        }
      );
      setTracks([localAudioTrack, localVideoTrack]);
    };
    getTracks();
  }, []);

  return tracks;
};
