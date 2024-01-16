import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AgoraRTCContextProvider } from './contexts/AgoraRTCContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AgoraRTCContextProvider>
      <App />
    </AgoraRTCContextProvider>
  </React.StrictMode>
);
