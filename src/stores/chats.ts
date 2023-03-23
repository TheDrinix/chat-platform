import { defineStore } from "pinia";
import type { Chat, ChatData, ChatsStore, ChatType } from "@/interfaces/chat";
import { useUserStore } from "@/stores/user";
import type { Message, MessageData } from "@/interfaces/message";
import { checkTokenExpirationError } from "@/helpers";

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
          this.storeChat(chatData);
        }
      } catch (e: any) {
        if (await checkTokenExpirationError(e)) {
          this.loadUsersChats();
          return;
        }

        console.error(e);
      }
    },
    async loadChatMessages(chatId: number) {
      const userStore = useUserStore();

      const token = userStore.tokens.access_token;

      if (!this.chatExists(chatId)) return;

      try {
        const res = await this.axios.get<MessageData[]>('/messages/' + chatId, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const messages = res.data;

        const chat = this.chats.get(chatId);

        if (!chat) return;

        messages.forEach(message => {
          const msg: Message = {
            id: message.id,
            text: message.text,
            author: message.author,
            createdAt: message.createdAt,
            attachment: message.attachments ? message.attachments[0] : undefined
          }

          chat.messages.set(message.id, msg);
        })

        this.chats.set(chatId, chat);
      } catch (e: any) {
        if (await checkTokenExpirationError(e)) {
          this.loadChatMessages(chatId);
          return;
        }
      }
    },
    storeChat(chatData: ChatData) {
      const chat: Chat = { ...chatData, messages: new Map };

      this.chats.set(chat.id, chat);
    },
    storeChatMessage(message: MessageData) {
      const chatId = message.chat.id;

      const chat = this.chats.get(chatId);

      if (!chat) return;

      const msg: Message = {
        id: message.id,
        author: message.author,
        createdAt: message.createdAt,
        text: message.text,
        attachment: message.attachments ? message.attachments[0] : undefined
      }

      chat.messages.set(message.id, msg);

      this.chats.set(chatId, chat);

    },
    removeChat(chat: ChatData) {
      this.chats.delete(chat.id);
    },
    removeChatMessage(chatId: number, messageId: number) {
      const chat = this.chats.get(chatId);

      if (!chat) return;

      chat.messages.delete(messageId);

      this.chats.set(chatId, chat);
    },
    updateChatMemberList(chatData: ChatData) {
      const chat = this.chats.get(chatData.id);

      if (!chat) return;

      chat.members = chatData.members;

      this.chats.set(chat.id, chat);
    }
  },
  getters: {
    getChatMessages(state) {
      return (chatId: number) => {
        const chat = state.chats.get(chatId);

        if (!chat) {
          return new Map<number, Message>;
        }

        return chat.messages
      }
    },
    chatExists(state) {
      return (chatId: number) => state.chats.has(chatId);
    },
    hasChatMessages(state) {
      return (chatId: number) => {
        const chat = state.chats.get(chatId);

        return !!chat?.messages.size ?? false;
      }
    },
    getChatName(state) {
      return (chatId: number) => {
        const userStore = useUserStore();

        const chat = state.chats.get(chatId);

        if (chat?.type === 'group') return chat.name;

        const user = chat?.members.filter(u => u.id !== userStore.user.id)[0];

        return `${user?.username}#${user?.public_uid}`
      }
    },
    isGroupChat(state) {
      return (chatId: number) => {
        return state.chats.get(chatId)?.type === 'group';
      }
    },
    getChatData(state) {
      return (chatId: number): Chat => {
        const chat = state.chats.get(chatId);

        if (!chat) return {
          id: -1,
          type: 'group',
          name: '',
          members: [],
          owner: null,
          messages: new Map
        }

        return {
          ...chat,
          messages: new Map
        }
      }
    }
  }
})