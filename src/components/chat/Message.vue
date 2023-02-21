<script setup lang="ts">
import type { Message } from "@/interfaces/message";
import { computed, inject, ref } from "vue";
import defaultUserPfpUrl from "@/assets/images/default_user_pfp.png"
import { useUserStore } from "@/stores/user";
import type { AxiosInstance } from "axios";
import { checkTokenExpirationError } from "@/helpers";
import { useChatsStore } from "@/stores/chats";

const userStore = useUserStore();
const chatsStore = useChatsStore();

const axios = inject<AxiosInstance>("axios");

if (!axios) throw new Error("Axios injection failed");

const props = defineProps<{
  message: Message,
  chatId: number
}>();

const serverUrl = import.meta.env["VITE_SERVER_URL"];

const messageContent = computed(() => props.message.text.split("\n"));

const messageControls = ref(false);

const authorPfp = computed(() => {
  return props.message.author.pfpUrl
    ? `${serverUrl}${props.message.author.pfpUrl}`
    : defaultUserPfpUrl;
});

const isUserMessageAuthor = computed(() => {
  return props.message.author.id === userStore.user.id;
})

const author_accent_color = computed(() => props.message.author.accent_color ?? '#b300ff')

const timestamp = computed(() => {
  const currentTime = new Date();
  const date = new Date(props.message.createdAt);

  const time_diff = new Date(
    currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()
  ).getTime() - new Date(
    date.getFullYear(), date.getMonth(), date.getDate()
  ).getTime();

  if (time_diff < 8 * 24 * 60 * 60 * 1000) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: "auto" });

    const dayText = rtf.format(-Math.floor(time_diff / 1000 / 60 / 60 / 24), 'day');

    return dayText.charAt(0).toUpperCase() + dayText.substring(1)
      + ' at '
      + Intl.DateTimeFormat('default', {timeStyle: 'short'}).format(date);
  }

  return Intl.DateTimeFormat('default', {dateStyle: 'medium', timeStyle: 'short'}).format(date);
})

const downloadFile = () => {
  console.log(props.message.attachment)
  window.open(`${serverUrl}${props.message.attachment?.urlPath || `/attachments/${props.message.attachment?.id}`}`, '_blank');
}

async function handleMessageDelete() {
  if (props.message.author.id !== userStore.user.id) return;

  const res = await axios?.delete(`/messages/${props.message.id}`, {
    headers: {
      Authorization: `Bearer ${userStore.tokens.access_token}`
    }
  }).catch(async (e: any) => {
    if (await checkTokenExpirationError(e)) {
      handleMessageDelete();
      return;
    }
  });

  if (!res) return;

  chatsStore.removeChatMessage(props.chatId, props.message.id);
}
</script>

<template>
  <div
    class="message"
    @mouseenter="messageControls = true"
    @mouseleave="messageControls = false"
  >
    <img :src="authorPfp" alt="author pfp" class="author-pfp">
    <div class="message-body">
      <div class="message-header">
        <span class="author-name">{{ message.author.username }}</span>
        <span class="message-creation-date">{{timestamp}}</span>
      </div>
      <div class="message-content">
        <p v-for="section in messageContent" v-text="section"></p>
        <div class="attachments" v-if="message.attachment">
          <!-- TODO:  Add ability to click open the images -->
          <img :src="serverUrl + message.attachment.urlPath" alt="message-attachment-image" v-if="message.attachment.mimetype.match(/^(image\/(.+))/gm)">
          <div v-else-if="false" class="video-player">

          </div>
          <div v-else>
            <v-chip size="small" color="primary" prepend-icon="mdi-download" variant="outlined" @click="downloadFile">{{message.attachment.originalFilename}}</v-chip>
          </div>
        </div>
      </div>
    </div>
    <div class="message-controls" v-if="isUserMessageAuthor && messageControls">
      <v-btn
        size="small"
        rounded
        variant="text"
        @click="handleMessageDelete"
      >
        <v-icon icon="mdi-delete" />
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  margin: 0.25rem 0;
  padding: 0 0.25rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
}

.author-pfp {
  height: 2.25rem;
  aspect-ratio: 1 / 1;
  margin-top: 0.375rem;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  color: v-bind('author_accent_color');
  font-weight: bold;
}

.message-body {
  margin-left: 0.75rem;
}

.message-body p {
  margin-bottom: 0.125rem;
}

.message-creation-date {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: #a4a4a4;
}

.attachments {
  max-height: 50vh;
}

.attachments img {
  max-width: 90%;
  max-height: 50vh;
}

@keyframes show-controls {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.message-controls {
  display: none;
  border-radius: 0.5rem;
  background-color: #373841;
  position: absolute;
  right: 0.5rem;
  top: -0.5rem;
}

.message:hover .message-controls {
  display: flex;
  animation: 0.8s show-controls 0s 1;
}

.message:hover {
  background-color: rgba(150,150,150, 0.1);
}
</style>