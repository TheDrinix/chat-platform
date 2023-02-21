<script setup lang="ts">
import { ChatRequest, ChatRequestType } from "@/interfaces/request";
import defaultGroupIconUrl from "@/assets/images/default_group_icon.png";
import defaultUserPfpUrl from "@/assets/images/default_user_pfp.png";
import { inject, ref } from "vue";
import { AxiosInstance } from "axios";
import { useUserStore } from "@/stores/user";
import { checkTokenExpirationError } from "@/helpers";
import { useChatRequestsStore } from "@/stores/requests";
import { useChatsStore } from "@/stores/chats";
import type { ChatData } from "@/interfaces/chat";

const axios = inject<AxiosInstance>("axios");
if (!axios) throw new Error('Axios injection error');

const serverUrl = import.meta.env["VITE_SERVER_URL"];

const userStore = useUserStore();
const requestsStore = useChatRequestsStore();
const chatsStore = useChatsStore();

const props = defineProps<{
  request: ChatRequest,
  requestType: ChatRequestType
}>()

const showControls = ref(false);

function getRequestIcon() {
  if (props.request.chat) {
    return defaultGroupIconUrl;
  } else {
    if (props.requestType === ChatRequestType.Sent) {
      return props.request.receiver.pfpUrl ? `${serverUrl}${props.request.receiver.pfpUrl}` : defaultUserPfpUrl;
    } else {
      return props.request.sender.pfpUrl ? `${serverUrl}${props.request.sender.pfpUrl}` : defaultUserPfpUrl;
    }
  }
}

async function deleteRequest() {
  const res = await axios?.delete(`/chats/request/${props.request.id}`, {
    headers: {
      Authorization: `Bearer ${userStore.tokens.access_token}`
    }
  }).catch(async (e: any) => {
    if (await checkTokenExpirationError(e)) {
      deleteRequest();
      return;
    }
  });

  if (!res) return;

  if (res.status === 204) {
    requestsStore.removeRequest(props.request.id, props.requestType);
  }
}

async function acceptRequest() {
  const res = await axios?.post<ChatData>(`/chats/request/${props.request.id}`, {}, {
    headers: {
      Authorization: `Bearer ${userStore.tokens.access_token}`
    }
  }).catch(async (e: any) => {
    if (await checkTokenExpirationError(e)) {
      acceptRequest();
      return;
    }
  });

  if (!res?.data) return;

  requestsStore.removeRequest(props.request.id, props.requestType);
  chatsStore.storeChat(res.data);
}
</script>

<template>
  <div
    class="request"
    @mouseenter="showControls = true"
    @mouseleave="showControls = false"
  >
    <div class="request-icon">
      <img :src="getRequestIcon()" />
    </div>
    <div class="request-content">
      <div class="request-title">
        <span>{{request.to === 'private' ? 'Request for private chat' : `Invite to ${request.chat.name}` }}</span>
      </div>
      <div class="request-user">
        <span v-if="requestType === ChatRequestType.Sent">
          To: {{request.receiver.username}}<span class="tag">#{{request.receiver.public_uid}}</span>
        </span>
        <span v-else>
          From: {{request.sender.username}}<span class="tag">#{{request.sender.public_uid}}</span>
        </span>
      </div>
    </div>
    <div class="request-controls" v-if="showControls">
      <template v-if="requestType === ChatRequestType.Sent">
        <v-btn
          icon="mdi-cancel"
          size="small"
          variant="text"
          color="error"
          @click="deleteRequest"
        />
      </template>
      <template v-else>
        <v-btn
          icon="mdi-check"
          size="small"
          variant="text"
          color="success"
          @click="acceptRequest"
        />
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          color="error"
          @click="deleteRequest"
        />
      </template>
    </div>
  </div>
</template>


<style scoped>
.request {
  max-height: 3rem;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: rgba(255, 255, 255, 0.15) 1px solid;
  box-sizing: content-box;
}

.request:last-child {
  padding-bottom: 0.75rem;
  border: none;
}

.request-icon {
  height: 3rem;
}

.request-icon img {
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  object-fit: cover;
}

.request-content {
  margin-left: 0.5rem;
}

.request-title span {
  font-weight: 500;
  font-size: 1.125rem;
}

.tag {
  font-size: .75rem;
  color: #8a828c;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.request-controls {
  display: none;
  opacity: 0;
  margin-left: auto;
}

.request:hover .request-controls {
  display: flex;
  opacity: 1;
  animation: 0.3s fade-in 0s 1;
}
</style>