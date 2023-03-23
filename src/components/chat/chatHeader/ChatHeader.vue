<script setup lang="ts">
import { useRoute } from "vue-router";
import { useChatsStore } from "@/stores/chats";
import { computed } from "vue";
import ChatSettingsDialog from "@/components/chat/chatHeader/ChatSettingsDialog.vue";
import ChatInviteDialog from "@/components/chat/chatHeader/ChatInviteDialog.vue";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const chatsStore = useChatsStore();
const userStore = useUserStore();

const chatId = computed(() => {
  return +route.params['chat_id'] ?? 0;
});

const chatName = computed(() => {
  return chatsStore.getChatName(chatId.value);
})

const isGroupChat = computed(() => {
  return chatsStore.isGroupChat(chatId.value);
})
</script>

<template>
  <header class="chat-header">
    <div>
      <h3>{{chatName}}</h3>
    </div>
    <div v-if="isGroupChat">
      <ChatInviteDialog :chat-id="chatId" />
      <ChatSettingsDialog :chat-id="chatId" />
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