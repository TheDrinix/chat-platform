<script setup lang="ts">
import Chat from "@/components/chat/chatList/Chat.vue";
import { useChatsStore } from "@/stores/chats";
import { computed } from "vue";

const chatsStore = useChatsStore();

const chats = computed(() => {
  return [...chatsStore.chats.values()]
})
</script>

<template>
  <div class="chat-list">
    <router-link to="/chats/" class="chat-item" exact-active-class="active" tag="div" style="margin: 0.25rem 0">
      <p class="chat-title"><v-icon icon="mdi-account-plus"></v-icon> Chat requests</p>
    </router-link>
    <hr>
    <Chat v-for="chat in chats" :chat="chat" />
  </div>
</template>

<style scoped>
.chat-list {
  height: 100vh;
  max-width: 368px;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: absolute;
  background: #16171a;
  padding: 0.5rem;
}

 :deep(.chat-item) {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.125rem;
  margin: 0.125rem 0;
  border-radius: 0.75rem;
  transition: all .3s ease;
  text-decoration: none;
  color: white;
}

:deep(.chat-item.active) {
  /*noinspection CssUnresolvedCustomProperty*/
  color: rgb(var(--v-theme-primary))
}

:deep(.chat-item:hover) {
  background: rgba(75,75,85,.3);
}

:deep(.chat-title) {
  padding-left: .5rem;
  font-size: 1.25rem;
}

:deep(.chat-logo) {
  height: 2.5rem;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
}

@media only screen and (min-width: 960px) {
  .chat-list {
    position: relative;
  }
}
</style>