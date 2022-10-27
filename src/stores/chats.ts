import { defineStore } from "pinia";
import type { Chat, ChatData, ChatsStore } from "@/interfaces/chat";
import { useUserStore } from "@/stores/user";

export const useChatsStore = defineStore({
  id: 'chats',
  state: (): ChatsStore => ({
    chats: new Map()
  }),
  actions: {
    async loadUsersChats() {
      const userStore = useUserStore();

      const token = userStore.tokens.access_token;

      try {
        const res = await this.axios.get<ChatData[]>('/chats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        for (let chatData of res.data) {
          const chat: Chat = { ...chatData, messages: new Map };

          this.chats.set(chat.id, chat);
        }
      } catch (e: any) {
        if (e.status === 401) {
          if (e.message === 'EXPIRED') {
            await userStore.refreshToken();
            this.loadUsersChats();
            return;
          }
        }

        console.error(e);
      }
    }
  }
})