import AgoraRTM, { RtmChannel, RtmClient, RtmMessage } from 'agora-rtm-sdk';
import { ReactNode, createContext, useCallback, useEffect, useState } from 'react';
import { userStore } from '../stores/userStore';

interface Props {
  children: ReactNode;
}

interface ChatMember {
  uid: string;
  displayName: string;
}

type ChatMessage = UserChatMessage | BotMessage;

interface UserChatMessage {
  type: 'chat';
  uid: string;
  displayName: string;
  message: string;
}

interface BotMessage {
  type: 'bot';
  message: string;
}

export interface AgoraRTMContextType {
  members: ChatMember[];
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
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleMemberJoined = useCallback(
    async (memberId: string) => {
      const { name } = await client.getUserAttributesByKeys(memberId, ['name']);
      setMessages(state => [...state, { type: 'bot', message: `${name}님이 입장했습니다.` }]);
      setMembers(state => [...state, { uid: memberId, displayName: name }]);
    },
    [client]
  );

  const handleMemberLeft = useCallback(
    async (memberId: string) => {
      const name = members.find(member => member.uid === memberId)?.displayName;
      if (name) {
        setMessages(state => [...state, { type: 'bot', message: `${name}님이 퇴장했습니다.` }]);
      }
      setMembers(state => state.filter(member => member.uid !== memberId));
    },
    [members]
  );

  const handleChannelMessage = useCallback((messageData: RtmMessage) => {
    const newMessage: ChatMessage = JSON.parse(messageData.text ?? '');
    setMessages(state => [...state, newMessage]);
  }, []);

  useEffect(() => {
    (async () => {
      await client.login({ uid });
      await channel.join();
      await client.addOrUpdateLocalUserAttributes({ name: uid }); // TODO: uid 대신 displayName 을 넣어야 함
      setDisplayName(uid); // TODO: 유저가 직접 이름을 입력할 수 있게 되면 여길 지웁니다.
      const memberIds = await channel.getMembers();
      const members = await Promise.all(
        memberIds.map(async memberId => {
          const { name: displayName } = await client.getUserAttributesByKeys(memberId, ['name']);
          return { uid: memberId, displayName };
        })
      );
      setMembers(members);
    })();
    const leaveChannel = () => {
      channel.leave();
      client.logout();
    };
    window.addEventListener('beforeunload', leaveChannel);
    return () => {
      window.removeEventListener('beforeunload', leaveChannel);
    };
  }, [channel, client, setDisplayName, uid]);

  useEffect(() => {
    channel.on('MemberJoined', handleMemberJoined);
    channel.on('MemberLeft', handleMemberLeft);
    channel.on('ChannelMessage', handleChannelMessage);
    return () => {
      channel.off('MemberJoined', handleMemberJoined);
      channel.off('MemberLeft', handleMemberLeft);
      channel.off('ChannelMessage', handleChannelMessage);
    };
  }, [channel, handleChannelMessage, handleMemberJoined, handleMemberLeft]);

  const sendMessage = useCallback(
    async (message: string) => {
      const newMessage: ChatMessage = { type: 'chat', uid, displayName, message };
      channel.sendMessage({ text: JSON.stringify(newMessage) });
      setMessages(state => [...state, newMessage]);
    },
    [channel, displayName, uid]
  );

  return <AgoraRTMContext.Provider value={{ members, messages, sendMessage }}>{children}</AgoraRTMContext.Provider>;
};
