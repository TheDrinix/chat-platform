<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useChatsStore } from "@/stores/chats";
import { computed, inject, ref } from "vue";
import type { Chat, ChatData } from "@/interfaces/chat";
import { useUserStore } from "@/stores/user";
import ChatMember from "@/components/chat/ChatMember.vue";
import { checkTokenExpirationError } from "@/helpers";
import { AxiosInstance } from "axios";

const route = useRoute();
const router = useRouter();
const chatsStore = useChatsStore();
const userStore = useUserStore();

const axios = inject<AxiosInstance>('axios');

if (!axios) throw new Error('Axios injection failed');

const groupChatSettingsDialog = ref(false);

const chatId = computed(() => {
  return +route.params['chat_id'] ?? 0;
});

const chat = computed<Chat | undefined>(() => {
  const chat = chatsStore.chats.get(chatId.value);

  return chat;
});

const isChatOwner = computed(() => {
  return chat.value?.owner?.id === userStore.user.id;
})

const handleChatLeave = async () => {
  try {
    const token = userStore.tokens.access_token;

    const res = await axios.post<ChatData>(`/chats/${chatId.value}/leave/`, {}, {
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
  <header class="chat-header">
    <div>
      <h3>{{chat.name}}</h3>
    </div>
    <div>
      <v-dialog v-model="groupChatSettingsDialog">
        <template v-slot:activator="{ props }">
          <v-btn size="small" variant="plain" icon="mdi-cog" :color="groupChatSettingsDialog ? 'primary' : ''" v-bind="props" />
        </template>

        <v-card id="chat-settings-dialog">
          <v-card-actions class="pb-1">
            <div>
              <v-card-title>
                {{chat.name}}
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
                    <ChatMember v-for="member of chat.members" :member="member" :chat-id="chat.id" :is-user-chat-owner="isChatOwner" />
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

.member-list {
  display: flex;
  flex-direction: column;
  max-height: 50vh;
  padding-right: 0.5rem;
  overflow-y: scroll;
  overflow-x: hidden;
}

#chat-settings-dialog {
  width: 90vw;
  margin: 0 auto;
}

@media only screen and (min-width: 580px) {
  #chat-settings-dialog {
    width: 75vw;
  }
}

@media only screen and (min-width: 768px) {
  #chat-settings-dialog {
    width: 66vw;
  }
}

@media only screen and (min-width: 960px) {
  #chat-settings-dialog {
    width: 55vw;
  }
}

@media only screen and (min-width: 1200px) {
  #chat-settings-dialog {
    width: 44vw;
    max-width: 1200px;
  }
}
</style>