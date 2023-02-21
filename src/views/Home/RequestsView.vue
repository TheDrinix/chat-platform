<script setup lang="ts">
import { useChatRequestsStore } from "@/stores/requests";
import { computed } from "vue";
import ChatRequest from "@/components/chat/chatRequests/ChatRequest.vue";
import ChatRequests from "@/components/chat/chatRequests/ChatRequests.vue";
import { ChatRequestType } from "@/interfaces/request";

const requestsStore = useChatRequestsStore();

const receivedRequests = computed(() => {
  return requestsStore.received;
})
</script>

<template>
  <div class="requests-view">
    <header>
      <h3>Chat requests</h3>
    </header>
    <v-container>
      <v-row>
        <v-col cols="6">
          <ChatRequests :type="ChatRequestType.Received" />
        </v-col>
        <v-col cols="6">
          <ChatRequests :type="ChatRequestType.Sent" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
  .requests-view header {
    display: flex;
    align-items: center;
    height: 3rem;
    padding: 0.5rem;
    box-sizing: border-box;
    background-color: #181819;
  }
</style>