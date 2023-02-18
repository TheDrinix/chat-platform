<script setup lang="ts">
import type { Message } from "@/interfaces/message";
import { computed, inject } from "vue";
import defaultUserPfpUrl from "@/assets/images/default_user_pfp.png"
import { SocketIOService } from "@/services/SocketIO";

const props = defineProps<{
  message: Message
}>();

const serverUrl = import.meta.env["VITE_SERVER_URL"];

const messageContent = computed(() => props.message.text.split("\n"));

const authorPfp = computed(() => {
  return props.message.author.pfpUrl
    ? `${serverUrl}${props.message.author.pfpUrl}`
    : defaultUserPfpUrl;
});

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
</script>

<template>
  <div class="message">
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
  </div>
</template>

<style scoped>
.message {
  display: flex;
  margin: 0.25rem 0;
}

.author-pfp {
  height: 2.25rem;
  aspect-ratio: 1 / 1;
  margin-top: 0.375rem;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  /*noinspection CssUnresolvedCustomProperty*/
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
</style>