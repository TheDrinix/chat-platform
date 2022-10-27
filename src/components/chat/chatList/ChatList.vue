<script setup lang="ts">
import Chat from "@/components/chat/chatList/Chat.vue";

</script>

<template>
  <div class="chat-list">
    <Chat />
  </div>
</template>

<style scoped>
.chat-list {
  height: 100vh;
  max-width: 368px;
  display: flex;
  flex-direction: column;
  position: absolute;
}

@media only screen and (min-width: 960px) {
  .chat-list {
    position: relative;
  }
}
</style>