<script setup lang="ts">
import { ChatRequestType } from "@/interfaces/request";
import { computed } from "vue";
import { useChatRequestsStore } from "@/stores/requests";
import ChatRequest from "@/components/chat/chatRequests/ChatRequest.vue";

const requestsStore = useChatRequestsStore();

const props = defineProps<{
  type: ChatRequestType
}>()

const requests = computed(() => {
  const requests = requestsStore[props.type === ChatRequestType.Received ? 'received' : 'sent'].values();

  const requestsArray = [...requests];

  return requestsArray.sort((a, b) => b.id - a.id);
})
</script>

<template>
  <v-card class="requests-list" max-height="80vh">
    <v-card-title class="requests-title">
      <v-icon :icon="type === ChatRequestType.Sent ? 'mdi-send' : 'mdi-email'" class="mr-2" />
      <span>
         {{type}} chat requests
       </span>
    </v-card-title>
    <v-divider />
    <div class="requests-body">
      <ChatRequest v-for="request of requests" :request="request" :request-type="type" :key="request.id" />
    </div>
  </v-card>
</template>

<style scoped>
  .requests-title * {
    height: 2.5rem;
    transition: color 0.4s ease;
  }

  .requests-list:hover .requests-title {
    color: rgb(var(--v-theme-primary));
  }

  .requests-body {
    max-height: calc(80vh - 3.5rem);
    background-color: rgba(160, 160, 200, 0.10);
    overflow-y: scroll;
  }
</style>