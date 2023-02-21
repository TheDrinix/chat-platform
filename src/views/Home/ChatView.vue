<script setup lang="ts">
import ChatHeader from "@/components/chat/chatHeader/ChatHeader.vue";
import Messages from "@/components/chat/Messages.vue";
import MessageField from "@/components/chat/MessageInput.vue";
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