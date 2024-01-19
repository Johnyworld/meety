import AgoraRTM, { RtmChannel, RtmClient, RtmMessage } from 'agora-rtm-sdk';
import { ReactNode, createContext, useCallback, useEffect, useState } from 'react';
import { userStore } from '../stores/userStore';

interface Props {
  children: ReactNode;
}

interface ChatMessage {
  uid: string;
  displayName: string;
  message: string;
}

export interface AgoraRTMContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
}

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const roomId = 'main';

export const AgoraRTMContext = createContext<AgoraRTMContextType | null>(null);

export const AgoraRTMContextProvider = ({ children }: Props) => {
  const [client, setClient] = useState<RtmClient | null>(null);
  const [channel, setChannel] = useState<RtmChannel | null>(null);

  useEffect(() => {
    (async () => {
      const client = await AgoraRTM.createInstance(APP_ID);
      const channel = await client.createChannel(roomId);
      setClient(client);
      setChannel(channel);
    })();
  }, []);

  if (!client || !channel) {
    return null;
  }

  return <AgoraRTMController client={client} channel={channel} children={children} />;
};

const AgoraRTMController = ({
  client,
  channel,
  children,
}: {
  client: RtmClient;
  channel: RtmChannel;
  children: ReactNode;
}) => {
  const { uid, displayName, setDisplayName } = userStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleChannelMessage = useCallback((messageData: RtmMessage) => {
    const newMessage: ChatMessage = JSON.parse(messageData.text ?? '');
    setMessages(state => [...state, newMessage]);
  }, []);

  useEffect(() => {
    (async () => {
      await client.login({ uid });
      await channel.join();
      await client.addOrUpdateLocalUserAttributes({ name: uid }); // TODO: uid 대신 displayName 을 넣어야 함
      setDisplayName(uid);
      channel.on('MemberJoined', handleMemberJoined);
      channel.on('MemberLeft', handleMemberLeft);
      channel.on('ChannelMessage', handleChannelMessage);
    })();

    const leaveChannel = () => {
      channel.off('MemberJoined', handleMemberJoined);
      channel.off('MemberLeft', handleMemberLeft);
      channel.off('ChannelMessage', handleChannelMessage);
      channel.leave();
      client.logout();
    };

    window.addEventListener('beforeunload', leaveChannel);
    return () => {
      window.removeEventListener('beforeunload', leaveChannel);
    };
  }, [channel, client, handleChannelMessage, setDisplayName, uid]);

  const sendMessage = useCallback(
    async (message: string) => {
      const newMessage: ChatMessage = { uid, displayName, message };
      channel.sendMessage({ text: JSON.stringify(newMessage) });
      setMessages(state => [...state, newMessage]);
    },
    [channel, displayName, uid]
  );

  return <AgoraRTMContext.Provider value={{ messages, sendMessage }}>{children}</AgoraRTMContext.Provider>;
};

const handleMemberJoined = async (memberId: string) => {
  console.log('=== A new member has joined the room: ', memberId);
};

const handleMemberLeft = async (memberId: string) => {
  console.log('=== A member has left the room: ', memberId);
};
