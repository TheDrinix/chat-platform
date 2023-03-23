<script setup lang="ts">
import ChatList from "@/components/chat/sidebar/Sidebar.vue";
import { useUserStore } from "@/stores/user";
import { useChatsStore } from "@/stores/chats";
import { useChatRequestsStore } from "@/stores/requests";
import { inject, onBeforeMount, onBeforeUnmount, ref } from "vue";
import type { MessageData } from "@/interfaces/message";
import { SocketIOService } from "@/services/SocketIO";
import type { ChatRequest } from "@/interfaces/request";
import { ChatRequestType } from "@/interfaces/request";
import type { ChatData } from "@/interfaces/chat";

const userStore = useUserStore();
const chatsStore = useChatsStore();
const requestsStore = useChatRequestsStore();

const socketIOService = inject<SocketIOService>('socketio');

const loadingData = ref(false);

if (!socketIOService) throw new Error("Socket io service injection failed");

if (userStore.isAuthenticated) {
    socketIOService.initializeConnection(import.meta.env['VITE_SERVER_URL'], userStore.tokens.access_token);

  if (!socketIOService.socket) throw new Error('Sockets error');
  // Chats
  socketIOService.socket.on('chat.member.leave', (payload: ChatData) => {
    chatsStore.updateChatMemberList(payload);
  })

  socketIOService.socket.on('chat.member.kick', (payload: ChatData) => {
    chatsStore.removeChat(payload);
  })

  // Chat requests
  socketIOService.socket.on('chat.request', (payload: ChatRequest) => {
    requestsStore.storeRequest(payload, ChatRequestType.Received);
  })

  socketIOService.socket.on('chat.request.accept', (payload: ChatData) => {
    if (payload.type === 'group') {
      chatsStore.updateChatMemberList(payload);
    } else {
      chatsStore.storeChat(payload);
    }
  })
  socketIOService.socket.on('chat.request.deny', (payload: ChatRequest) => {
    requestsStore.removeRequest(payload.id, ChatRequestType.Sent);
  })
  socketIOService.socket.on('chat.request.remove', (payload: ChatRequest) => {
    requestsStore.removeRequest(payload.id, ChatRequestType.Received);
  })

  // Messages
  socketIOService.socket.on('message.sent', (payload: MessageData) => {
    chatsStore.storeChatMessage(payload);
  })

  socketIOService.socket.on('message.delete', (payload: MessageData) => {
    chatsStore.removeChatMessage(payload.chat.id, payload.id);
  })
}

onBeforeMount(async () => {
  if (userStore.isAuthenticated) {
    loadingData.value = true;
    await Promise.all([chatsStore.loadUsersChats(), requestsStore.loadRequests()]);
    loadingData.value = false;
  }
})

onBeforeUnmount(() => {
  socketIOService.disconnect()
})
</script>

<template>
<div class="container" v-if="!loadingData">
  <ChatList />
  <div class="view">
    <RouterView />
  </div>
</div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.view {
  width: 100%;
  height: 100vh;
  margin-left: 3.5rem;
}

@media only screen and (min-width: 960px) {
  .view {
    margin-left: 0rem;
  }
}
</style>