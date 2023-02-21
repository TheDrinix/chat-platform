<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { AxiosInstance } from "axios";
import { Chat, ChatData } from "@/interfaces/chat";
import { checkTokenExpirationError } from "@/helpers";
import { useChatsStore } from "@/stores/chats";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import ChatMember from "@/components/chat/chatHeader/ChatMember.vue";

const chatsStore = useChatsStore();
const userStore = useUserStore();
const router = useRouter();

const axios = inject<AxiosInstance>('axios');

if (!axios) throw new Error('Axios injection failed');

const props = defineProps<{
  chat: Chat
}>()

const groupChatSettingsDialog = ref(false);

const isChatOwner = computed(() => {
  return props.chat?.owner?.id === userStore.user.id;
})

const handleChatLeave = async () => {
  try {
    const token = userStore.tokens.access_token;

    const res = await axios.post<ChatData>(`/chats/${props.chat.id}/leave/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    chatsStore.removeChat(res.data);
    await router.push({name: 'chatRequests'});
  } catch (e: any) {
    if (await checkTokenExpirationError(e)) {
      handleChatLeave();
      return;
    }
  }
}
</script>

<template>
  <v-dialog v-model="groupChatSettingsDialog">
    <template v-slot:activator="{ props }">
      <v-btn size="small" variant="plain" icon="mdi-cog" :color="groupChatSettingsDialog ? 'primary' : ''" v-bind="props" />
    </template>

    <v-card class="chat-dialog">
      <v-card-actions class="pb-1">
        <div>
          <v-card-title>
            {{props.chat.name}}
          </v-card-title>
        </div>
        <div class="ml-auto">
          <v-btn color="primary" icon="mdi-close" size="small" block @click="groupChatSettingsDialog = false"></v-btn>
        </div>
      </v-card-actions>
      <v-divider />
      <v-card-item class="pt-2">
        <h4>Change group name</h4>
        <v-text-field label="New group name" color="primary"></v-text-field>
      </v-card-item>
      <v-divider />
      <v-card-item>
        <v-expansion-panels>
          <v-expansion-panel title="Members">
            <v-expansion-panel-text>
              <v-list lines="false" class="member-list">
                <ChatMember v-for="member of props.chat.members" :member="member" :chat-id="props.chat.id" :is-user-chat-owner="isChatOwner" />
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-item>
      <v-card-actions>
        <v-btn color="warning" :disabled="isChatOwner" @click="handleChatLeave">
          Leave chat
        </v-btn>
        <v-btn v-if="isChatOwner" color="error">Delete chat</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.member-list {
  display: flex;
  flex-direction: column;
  max-height: 50vh;
  padding-right: 0.5rem;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>