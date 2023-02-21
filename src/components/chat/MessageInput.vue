<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import type { AxiosInstance } from "axios";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import type { MessageData } from "@/interfaces/message";
import { useChatsStore } from "@/stores/chats";
import { AxiosError } from "axios";
import { checkTokenExpirationError } from "@/helpers";
import { useDisplay } from "vuetify";

const axios = inject<AxiosInstance>('axios');
if (!axios) throw new Error('Axios injection error');

const route = useRoute();

const chatId = computed(() => {
  return +route.params['chat_id'] ?? 0;
})

const userStore = useUserStore();
const chatsStore = useChatsStore()

const isDisplayLg = useDisplay().lgAndUp;

let fileInput: Ref<null | HTMLInputElement> = ref(null)

let messageText = ref('');

let attachment: Ref<File | null> = ref(null);

let isSending = ref(false);

const handleAttach = () => {
  if (fileInput.value) fileInput.value?.click();
}

const handleAttachmentChange = () => {
  const fileInputVal = fileInput.value;

  if (!fileInputVal) return;

  attachment.value = fileInputVal.files?.item(0) ?? null;
}

const handleMessageSend = async (e: KeyboardEvent | MouseEvent) => {
  if (e instanceof KeyboardEvent) {
    if (e.shiftKey) {
      messageText.value += '\n';
      return;
    }

    if (!isDisplayLg.value) {
      messageText.value += '\n';
      return;
    }
  }

  if (isSending.value) return;

  if (!chatId) return;

  if (!attachment.value && !messageText.value) return;

  isSending.value = true;

  try {
    const formData = new FormData();

    formData.append('text', messageText.value);
    if (attachment.value) {
      formData.append('attachment', attachment.value);
    }

    const token = userStore.tokens.access_token;

    const res = await axios.post<MessageData>(`/messages/${chatId.value}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    const message = res.data;

    chatsStore.storeChatMessage(message);

    isSending.value = false;
    messageText.value = "";
  } catch (err: any | AxiosError) {
    isSending.value = false;
    if (await checkTokenExpirationError(err)) {
      handleMessageSend(e);
      return;
    }
  }

}
</script>

<template>
  <div class="message-input-container">
    <v-textarea
      color="primary"
      variant="outlined"
      name="message"
      id="message"
      v-model="messageText"
      :density="isDisplayLg ? 'default' : 'comfortable'"
      :max-rows="4"
      rows="1"
      auto-grow
      @keydown.enter.prevent="handleMessageSend"
      hide-details
      class="mb-2"
    >
      <template v-slot:append-inner>
        <v-icon v-if="!isSending" icon="mdi-send" @click="handleMessageSend"></v-icon>
        <v-progress-circular v-else color="primary" indeterminate />
      </template>

      <template v-slot:prepend-inner>
        <label for="attachment" class="attach-file-btn" @click="handleAttach">
          <v-icon icon="mdi-paperclip" />
        </label>
        <v-chip size="small" color="primary" closable @click:close="attachment = null" v-if="attachment">{{attachment.name}}</v-chip>
      </template>
    </v-textarea>
    <input type="file" name="attachment" id="attachment" v-on:change="handleAttachmentChange" hidden ref="fileInput">
  </div>
</template>

<style scoped>
.message-input-container {
  padding: 0 0.625rem;
}

.attach-file-btn {
  cursor: pointer;
}
</style>