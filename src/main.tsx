import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AgoraRTMContextProvider } from './contexts/agoraRTMContext.tsx';
import { AgoraRTC } from './components/AgoraRTC';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AgoraRTMContextProvider>
      <AgoraRTC.Provider>
        <App />
      </AgoraRTC.Provider>
    </AgoraRTMContextProvider>
  </React.StrictMode>
);
