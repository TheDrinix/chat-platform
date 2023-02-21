<script setup lang="ts">
import { useRoute } from "vue-router";
import { useChatsStore } from "@/stores/chats";
import { computed } from "vue";
import type { Chat } from "@/interfaces/chat";
import ChatSettingsDialog from "@/components/chat/chatHeader/ChatSettingsDialog.vue";
import ChatInviteDialog from "@/components/chat/chatHeader/ChatInviteDialog.vue";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const chatsStore = useChatsStore();
const userStore = useUserStore();

const chatId = computed(() => {
  return +route.params['chat_id'] ?? 0;
});

const chat = computed<Chat | undefined>(() => {
  const chat = chatsStore.chats.get(chatId.value);

  return chat;
});

const chatName = computed(() => {
  if (chat.value?.type === 'group') return chat.value?.name;

  const user = chat.value?.members.filter(u => u.id !== userStore.user.id)[0];

  return `${user?.username}#${user?.public_uid}`
})
</script>

<template>
  <header class="chat-header">
    <div>
      <h3>{{chatName}}</h3>
    </div>
    <div v-if="chat.type === 'group'">
      <ChatInviteDialog :chat="chat" />
      <ChatSettingsDialog :chat="chat" />
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 3rem;
  padding: 0.5rem;
  box-sizing: border-box;
  background: #181819;
}


</style>