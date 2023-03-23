<script setup lang="ts">
import ChatHeader from "@/components/chat/chatHeader/ChatHeader.vue";
import Messages from "@/components/chat/Messages.vue";
import MessageField from "@/components/chat/MessageInput.vue";
import { useChatsStore } from "@/stores/chats";
import { computed, onBeforeMount, onBeforeUpdate } from "vue";
import { useRoute, useRouter } from "vue-router";

const chatsStore = useChatsStore()
const route = useRoute()
const router = useRouter();

const chatId = computed(() => {
  return +route.params['chat_id'] ?? 0;
});

function checkChatExistence() {
  if (!chatsStore.chatExists(chatId.value)) {
    router.push({
      name: 'home'
    })
  }
}

onBeforeMount(checkChatExistence)
onBeforeUpdate(checkChatExistence)
</script>

<template>
  <div class="chat-view">
    <ChatHeader />
    <Messages />
    <MessageField />
  </div>
</template>

<style scoped>
.chat-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>