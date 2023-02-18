<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide } from "vue";
import { useUserStore } from "@/stores/user";
import { SocketIOService } from "@/services/SocketIO";
import ChatList from "@/components/chat/sidebar/Sidebar.vue";
import { useChatsStore } from "@/stores/chats";
import { MessageData } from "@/interfaces/message";

const userStore = useUserStore();
const chatsStore = useChatsStore();

const socketIOService = new SocketIOService();

if (userStore.isAuthenticated) {
  await Promise.all([chatsStore.loadUsersChats()])

  socketIOService.initializeConnection(import.meta.env['VITE_SERVER_URL'], userStore.tokens.access_token);

  provide('socketio', socketIOService);

  if (!socketIOService.socket) throw new Error('Sockets error');

  socketIOService.socket.on('message.sent', (payload: MessageData) => {
    chatsStore.storeChatMessage(payload)
  })
}

onBeforeUnmount(() => {
  socketIOService.disconnect()
})
</script>

<template>
<div class="container">
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