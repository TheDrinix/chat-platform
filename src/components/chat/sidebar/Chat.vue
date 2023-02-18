<script setup lang="ts">
import type { Chat } from "@/interfaces/chat";
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import defaultGroupIconUrl from '@/assets/images/default_group_icon.png'
import defaultUserPfpUrl from "@/assets/images/default_user_pfp.png"

const userStore = useUserStore();

const props = defineProps<{
  chat: Chat
}>()

const serverUrl = import.meta.env["VITE_SERVER_URL"];

const currentUser = computed(() => userStore.user);

const data = computed(() => {
  if (props.chat.type === 'group') {
    return {
      name: props.chat.name,
      logo: defaultGroupIconUrl
    };
  }

  const members = props.chat.members;

  const usr = members.find((member) => member.id !== currentUser.value.id);

  return {
    name: usr?.username ?? props.chat.name,
    logo: usr?.pfpUrl ? `${serverUrl}${usr?.pfpUrl}` : defaultUserPfpUrl
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