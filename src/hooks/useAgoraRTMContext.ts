import { useContext } from 'react';
import { AgoraRTMContext, AgoraRTMContextType } from '../contexts/agoraRTMContext';

export const useAgoraRTMContext = (): AgoraRTMContextType => {
  const context = useContext(AgoraRTMContext);

  if (!context) {
    throw Error('useAgoraRTCContext: AgoraRTCContextProvider 내에서 사용해주세요.');
  }

  return context;
};
