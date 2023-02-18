<script setup lang="ts">
import Message from "@/components/chat/Message.vue";
import { useRoute } from "vue-router";
import { computed, inject, watch } from "vue";
import { useChatsStore } from "@/stores/chats";
import type { Message as MessageType, MessageData } from "@/interfaces/message";
import { SocketIOService } from "@/services/SocketIO";

const route = useRoute();
const chatsStore = useChatsStore()

const chatId = computed(() => {
  return +route.params['chat_id'] ?? 0;
})

const messages = computed<MessageType[]>(() => {
  const chatMessages = chatsStore.getChatMessages(chatId.value);

  const arr = [...chatMessages.values()];

  return arr.sort((a, b) => b.id - a.id)
})

watch(chatId, (newChatId, prevChatId) => {
  chatsStore.loadChatMessages(newChatId)
})

chatsStore.loadChatMessages(chatId.value);


</script>

<template>
  <div class="message-list">
    <Message v-for="message in messages" :message="message" :key="message.id" />
  </div>
</template>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  padding: 0 0.5rem;
  overflow-y: scroll;
  overflow-x: hidden;
}

/* ===== Scrollbar CSS ===== */
/* Firefox */
.message-list {
  scrollbar-width: auto;
  scrollbar-color: #8f54a0 #202225;
}

/* Chrome, Edge, and Safari */
.message-list::-webkit-scrollbar {
  width: 12px;
}

.message-list::-webkit-scrollbar-track {
  background: #202225;
}

.message-list::-webkit-scrollbar-thumb {
  background-color: #8f54a0;
  border-radius: 10px;
  border: 3px solid #202225;
}
</style>