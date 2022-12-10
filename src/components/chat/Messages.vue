<script setup lang="ts">
import Message from "@/components/chat/Message.vue";
import { useRoute } from "vue-router";
import { computed, watch } from "vue";
import { useChatsStore } from "@/stores/chats";
import type { Message as MessageType } from "@/interfaces/message";

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
</style>