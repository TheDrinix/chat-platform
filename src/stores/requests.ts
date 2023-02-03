import { defineStore } from "pinia";
import type { ChatRequest, ChatRequestsStore } from "@/interfaces/request";
import { useUserStore } from "@/stores/user";
import { checkTokenExpirationError } from "@/helpers";

export const useChatRequestsStore = defineStore({
  id: 'requests',
  state: (): ChatRequestsStore => ({
    received: [],
    sent: []
  }),
  getters: {
    received_requests_count: state => state.received.length
  },
  actions: {
    async loadReceivedRequests() {
      const userStore = useUserStore();
      const token = userStore.tokens.access_token;

      try {
        const res = await this.axios.get<ChatRequest[]>('/chats/request', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const requests = res.data;

        if (requests) {
          this.received = requests;
        }
      } catch (e: any) {
        if (await checkTokenExpirationError(e)) {
          this.loadReceivedRequests();
          return;
        }
      }
    }
  }
})