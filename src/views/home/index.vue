<script setup lang="ts">
import ChatList from "@/components/chat/sidebar/Sidebar.vue";
import { useUserStore } from "@/stores/user";
import { useChatsStore } from "@/stores/chats";
import { useChatRequestsStore } from "@/stores/requests";

const userStore = useUserStore();
const chatsStore = useChatsStore();
const requestsStore = useChatRequestsStore();

if (userStore.isAuthenticated) {
  await Promise.all([chatsStore.loadUsersChats(), requestsStore.loadRequests()]);
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
  margin-left: 3.5rem;
}

@media only screen and (min-width: 960px) {
  .view {
    margin-left: 0rem;
  }
}
</style>