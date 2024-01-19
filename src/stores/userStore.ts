import { create } from 'zustand';

interface UserState {
  uid: string;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const getUID = (): string => {
  const uidFromStorage = sessionStorage.getItem('uid');
  if (!uidFromStorage) {
    const newUID = String(Math.floor(Math.random() * 10000));
    sessionStorage.setItem('uid', newUID);
    return newUID;
  }
  return uidFromStorage;
};

export const userStore = create<UserState>()(set => ({
  uid: getUID(),
  displayName: '',
  setDisplayName: newValue => set(() => ({ displayName: newValue })),
}));
