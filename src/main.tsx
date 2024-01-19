import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AgoraRTCContextProvider } from './contexts/AgoraRTCContext.tsx';
import { AgoraRTMContextProvider } from './contexts/agoraRTMContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AgoraRTMContextProvider>
      <AgoraRTCContextProvider>
        <App />
      </AgoraRTCContextProvider>
    </AgoraRTMContextProvider>
  </React.StrictMode>
);
