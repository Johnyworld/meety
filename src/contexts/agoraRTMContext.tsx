import AgoraRTM, { RtmChannel, RtmClient } from 'agora-rtm-sdk';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { userStore } from '../stores/userStore';

interface Props {
  children: ReactNode;
}

interface AgoraRTMContextType {}

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const roomId = 'main';

export const AgoraRTMContext = createContext<AgoraRTMContextType>({});

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
  const uid = userStore(state => state.uid);

  useEffect(() => {
    (async () => {
      await client.login({ uid });
      await channel.join();
      await client.addOrUpdateLocalUserAttributes({ name: uid }); // TODO: uid 대신 displayName 을 넣어야 함
      channel.on('MemberJoined', handleMemberJoined);
      channel.on('MemberLeft', handleMemberLeft);
    })();

    const leaveChannel = () => {
      channel.leave();
      client.logout();
    };

    window.addEventListener('beforeunload', leaveChannel);

    return () => {
      window.removeEventListener('beforeunload', leaveChannel);
      channel.off('MemberJoined', handleMemberJoined);
      channel.off('MemberLeft', handleMemberLeft);
    };
  }, [channel, client, uid]);

  return <AgoraRTMContext.Provider value={{}}>{children}</AgoraRTMContext.Provider>;
};

const handleMemberJoined = async (memberId: string) => {
  console.log('=== A new member has joined the room: ', memberId);
};

const handleMemberLeft = async (memberId: string) => {
  console.log('=== A member has left the room: ', memberId);
};
