<script setup lang="ts">
import { onMounted, provide } from "vue";
import { useUserStore } from "@/stores/user";
import { SocketIOService } from "@/services/SocketIO";
import ChatList from "@/components/chat/chatList/ChatList.vue";
import { useChatsStore } from "@/stores/chats";

const userStore = useUserStore();
const chatsStore = useChatsStore();

if (userStore.isAuthenticated) {
  await Promise.all([chatsStore.loadUsersChats()])

  const socketIOService = new SocketIOService();

  socketIOService.initializeConnection(import.meta.env['VITE_SERVER_URL'], userStore.tokens.access_token);

  provide('socketio', socketIOService);

  if (!socketIOService.socket) throw new Error('Sockets error');

  socketIOService.socket.on('message.sent', (payload: any) => {
    console.log(payload)
  })
}
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
}
</style>