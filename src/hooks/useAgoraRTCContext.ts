import { useContext } from 'react';
import { AgoraRTCContext } from '../contexts/AgoraRTCContext';

export const useAgoraRTCContext = () => {
  const context = useContext(AgoraRTCContext);

  if (!context.client) {
    throw Error('useAgoraRTCContext: AgoraRTCContextProvider 내에서 사용해주세요.');
  }

  return context;
};
