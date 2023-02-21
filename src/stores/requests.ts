import { defineStore } from "pinia";
import type { ChatRequest, ChatRequestsStore } from "@/interfaces/request";
import { ChatRequestType } from "@/interfaces/request";
import { useUserStore } from "@/stores/user";

export const useChatRequestsStore = defineStore({
  id: 'requests',
  state: (): ChatRequestsStore => ({
    received: new Map,
    sent: new Map
  }),
  getters: {
    received_requests_count: state => state.received.size
  },
  actions: {
    async loadRequests() {
      const userStore = useUserStore();

      try {
        const headers = {
          Authorization: `Bearer ${userStore.tokens.access_token}`
        }

        const resReceivedPromise = this.axios.get<ChatRequest[]>('/chats/requests', {
          headers,
          params: {
            type: 'received'
          }
        });

        const resSentPromise = this.axios.get<ChatRequest[]>('/chats/requests', {
          headers,
          params: {
            type: 'sent'
          }
        });

        const [receivedRequestsRes, sentRequestsRes] = await Promise.all([resReceivedPromise, resSentPromise]);

        for (let request of receivedRequestsRes.data) {
          this.received.set(request.id, request);
        }

        for (let request of sentRequestsRes.data) {
          this.sent.set(request.id, request);
        }

      } catch (e: any) {

      }
    },
    storeRequest(request: ChatRequest, type: ChatRequestType) {
      const requests = type === ChatRequestType.Sent ? this.sent : this.received;

      requests.set(request.id, request);

      switch (type) {
        case ChatRequestType.Received:
          this.received = requests;
          break;
        case ChatRequestType.Sent:
          this.sent = requests;
          break;
      }
    },
    removeRequest(id: number, type: ChatRequestType) {
      console.log('Removing requests')

      const requests = type === ChatRequestType.Sent ? this.sent : this.received;

      requests.delete(id);

      switch (type) {
        case ChatRequestType.Received:
          this.received = requests;
          break;
        case ChatRequestType.Sent:
          this.sent = requests;
          break;
      }
    }
  }
})