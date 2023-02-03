<script setup lang="ts">
import type { Chat } from "@/interfaces/chat";
import { computed } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const props = defineProps<{
  chat: Chat
}>()

const currentUser = computed(() => userStore.user);

const data = computed(() => {
  if (props.chat.type === 'group') {
    return {
      name: props.chat.name,
      logo: 'https://via.placeholder.com/512'
    };
  }

  const members = props.chat.members;

  const usr = members.find((member) => member.id !== currentUser.value.id);

  return {
    name: usr?.username ?? props.chat.name,
    logo: usr?.pfpUrl ?? 'https://via.placeholder.com/512'
  };
})
</script>

<template>
  <router-link :to="`/chats/${props.chat.id}`" tag="div" class="chat-item" active-class="active">
    <img :src="data.logo" alt="group" class="chat-logo">
    <p class="chat-title">{{data.name}}</p>
  </router-link>
</template>

<style scoped>

</style>