import { createContext } from 'react';
import { AgoraRTCContextType } from '../types';

export const AgoraRTCContext = createContext<AgoraRTCContextType | null>(null);
