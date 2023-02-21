<script setup lang="ts">
import Chat from "@/components/chat/sidebar/Chat.vue";
import { useChatsStore } from "@/stores/chats";
import { computed, inject, onBeforeUnmount, ref } from "vue";
import { checkTokenExpirationError } from "@/helpers";
import { useUserStore } from "@/stores/user";
import type { AxiosInstance } from "axios";
import defaultUserPfpUrl from "@/assets/images/default_user_pfp.png";
import { SocketIOService } from "@/services/SocketIO";
import { MessageData } from "@/interfaces/message";
import type { ChatRequest } from "@/interfaces/request";
import { ChatRequestType } from "@/interfaces/request";
import { useChatRequestsStore } from "@/stores/requests";

const axios = inject<AxiosInstance>("axios");
if (!axios) throw new Error('Axios injection error');

const chatsStore = useChatsStore();
const userStore = useUserStore();
const requestsStore = useChatRequestsStore();

const serverUrl = import.meta.env["VITE_SERVER_URL"];

let createChatDialog = ref(false);
let userIdentifier = ref('');
let groupName = ref('');
let isLoading = ref(false);

const chats = computed(() => {
  return [...chatsStore.chats.values()]
})

const socketIOService = inject<SocketIOService>('socketio');

if (!socketIOService) throw new Error("Socket io service injection failed");

if (userStore.isAuthenticated) {
    socketIOService.initializeConnection(import.meta.env['VITE_SERVER_URL'], userStore.tokens.access_token);

  if (!socketIOService.socket) throw new Error('Sockets error');

  socketIOService.socket.on('message.sent', (payload: MessageData) => {
    chatsStore.storeChatMessage(payload)
  })
}

onBeforeUnmount(() => {
  socketIOService.disconnect()
})

const handleRequestSend = async () => {
  if (!/^.{3,120}#[a-zA-Z0-9]{4}$/gm.test(userIdentifier.value)) return;

  isLoading.value = true;

  const [username, uid] = userIdentifier.value.split('#');

  try {
    const token = userStore.tokens.access_token;

    const res = await axios.post<ChatRequest>('/chats/requests', {
      receiverUsername: username,
      receiverUid: uid
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    userIdentifier.value = '';
    createChatDialog.value = false;

    requestsStore.storeRequest(res.data, ChatRequestType.Sent)
  } catch (e: any) {
    isLoading.value = false;
    if (await checkTokenExpirationError(e)) {
      handleRequestSend();
      return;
    }
  }
  isLoading.value = false;
}

const handleCreateGroup = async () => {
  if (groupName.value.length < 3) return;

  isLoading.value = true;

  try {
    const token = userStore.tokens.access_token;

    // TODO: Do the same thing here lol
    const res = await axios.post('/chats/group', { groupName: groupName.value }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    groupName.value = '';
    createChatDialog.value = false;
  } catch (e: any) {
    isLoading.value = false;
    if (await checkTokenExpirationError(e)) {
      handleCreateGroup();
      return;
    }
  }
  isLoading.value = false;
}
</script>

<template>
  <div id="sidebar">
    <div class="chat-list">
      <div id="requests-btn">
        <div class="w-100">
          <router-link to="/chats" tag="a" exact-active-class="active">
            <v-icon icon="mdi-email" size="large" class="icon" />
            <span>Chat requests</span>
          </router-link>
        </div>
        <div class="ml-auto">
          <v-dialog v-model="createChatDialog">
            <template v-slot:activator="{ props }">
              <a id="start-chat-btn" v-bind="props">
                <v-icon icon="mdi-plus-circle" size="large" class="icon" />
              </a>
            </template>

            <v-card id="create-chat-dialog" :loading="isLoading">
              <template v-slot:loader="{ isActive }">
                <v-progress-linear
                  :active="isActive"
                  color="primary"
                  height="4"
                  indeterminate
                />
              </template>

              <v-card-actions>
                <div class="ml-auto">
                  <v-btn color="primary" icon="mdi-close" size="small" block @click="createChatDialog = false"></v-btn>
                </div>
              </v-card-actions>
              <v-card-item>
                <v-card-title>Request a private chat</v-card-title>
                <div>
                  <v-text-field
                    density="comfortable"
                    append-icon="mdi-send"
                    @click:append="handleRequestSend"
                    @keydown.enter="handleRequestSend"
                    v-model="userIdentifier"
                    :rules="[
                      () => /^.{3,120}#[a-zA-Z0-9]{4}$/gm.test(userIdentifier) || 'Enter a valid user identifier'
                    ]"
                  >
                    <template v-slot:label>
                      <span>
                         <v-icon icon="mdi-account" /> Enter a Username#0000
                      </span>
                    </template>
                  </v-text-field>
                </div>
              </v-card-item>
              <v-divider />
              <v-card-item>
                <v-card-title>Create a group chat</v-card-title>
                <div>
                  <v-text-field
                    density="comfortable"
                    append-icon="mdi-send"
                    @click:append="handleCreateGroup"
                    @keydown.enter="handleCreateGroup"
                    v-model="groupName"
                    :rules="[
                      () => groupName.length >= 3 || 'Group name must be at least 3 characters long',
                    ]"
                  >
                    <template v-slot:label>
                      <span>
                         <v-icon icon="mdi-account-group" /> Enter a group chat name
                      </span>
                    </template>
                  </v-text-field>
                </div>
              </v-card-item>
            </v-card>
          </v-dialog>
        </div>
      </div>
    </div>
    <hr>
    <div class="chat-list">
      <Chat v-for="chat in chats" :chat="chat" />
    </div>
    <hr style="margin-top: auto">
    <div id="user-info">
      <div class="user-pfp">
        <img :src="userStore.user.pfpUrl ? `${serverUrl}${userStore.user.pfpUrl}` : defaultUserPfpUrl" alt="User profile picture" class="chat-logo">
      </div>
      <div class="username">
        <span>{{userStore.user.username}}<span class="tag">#{{userStore.user.public_uid}}</span></span>
      </div>
      <div id="user-controls">
        <router-link to="/user" custom v-slot="{ navigate }">
          <v-icon icon="mdi-cog" @click="navigate" role="link" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
#sidebar {
  display: flex;
  flex-direction: column;
  width: 3.5rem;
  max-width: 320px;
  height: 100vh;
  padding: 0 0.5rem;
  box-sizing: border-box;
  background: #16171a;
  overflow: hidden;
  transition: all 0.35s ease;
  position: absolute;
  z-index: 99;
}

#sidebar:hover,
#sidebar.open {
  width: 90vw;
}

.chat-list {
  max-width: 100%;
  min-width: 2.5rem;
  margin: 0.25rem 0;
  display: flex;
  flex-direction: column;
  overflow: scroll;
}

.chat-list::-webkit-scrollbar {
  display: none;
}

 :deep(.chat-item) {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0.125rem 0;
  border-radius: 0.25rem;
  transition: all .3s ease;
  text-decoration: none;
  color: white;
}

:deep(.chat-item.active),
#requests-btn a.active {
  /*noinspection CssUnresolvedCustomProperty*/
  color: rgb(var(--v-theme-primary))
}

:deep(.chat-item:hover),
#requests-btn a:hover {
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
  transition: all 0.2s ease-out;
  object-fit: cover;
}

.active :deep(.chat-logo) {
  /*noinspection CssUnresolvedCustomProperty*/
  border: rgb(var(--v-theme-primary)) 2px solid;
  padding: 2px;
}

#requests-btn {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0.125rem 0;
  border-radius: 0.25rem;
}

#requests-btn a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  transition: background-color 0.3s ease;
}

#requests-btn .icon {
  min-width: 2.5rem;
  min-height: 2.5rem;
  padding: 0.75rem;
}

#requests-btn #start-chat-btn {
  cursor: pointer;
}

#requests-btn span,
#requests-btn #start-chat-btn,
:deep(.chat-title) {
  font-size: 0rem;
  transition: font-size 0.2s ease;
}

#user-info {
  display: flex;
  align-items: center;
  margin: 0.375rem 0;
}

#user-info .user-pfp {
  height: 2.5rem;
}

#user-info .username {
  margin-left: .5rem;
}

.username .tag {
  font-size: .75rem;
  color: #8a828c;
}

#user-info #user-controls {
  margin-left: auto;
}

#sidebar:hover #requests-btn span,
#sidebar:hover #requests-btn #start-chat-btn,
#sidebar:hover :deep(.chat-title),
#sidebar.open #requests-btn span,
#sidebar.open #requests-btn #start-chat-btn,
#sidebar.open :deep(.chat-item)
{
  font-size: 1rem;
}

#create-chat-dialog {
  width: 90vw;
  margin: 0 auto;
}

@media only screen and (min-width: 580px) {
  #create-chat-dialog {
    width: 66vw;
  }
}

@media only screen and (min-width: 960px) {
  #sidebar {
    position: relative;
  }

  #create-chat-dialog {
    width: 40vw;

  }
}
</style>