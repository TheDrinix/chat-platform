<script setup lang="ts">
import { computed, inject, ref } from "vue";
import type { Chat } from "@/interfaces/chat";
import { AxiosInstance } from "axios";
import type { ChatRequest } from "@/interfaces/request";
import { ChatRequestType } from "@/interfaces/request";
import { useUserStore } from "@/stores/user";
import { checkTokenExpirationError } from "@/helpers";
import { useChatRequestsStore } from "@/stores/requests";

const userStore = useUserStore();
const requestsStore = useChatRequestsStore();

const axios = inject<AxiosInstance>('axios');

if (!axios) throw new Error('Axios injection failed');

const props = defineProps<{
  chat: Chat
}>()

let groupInviteDialog = ref(false);
let userIdentifier = ref('');

const isIdentifierValid = computed(() => {
  return /^.{3,120}#[a-zA-Z0-9]{4}$/gm.test(userIdentifier.value);
})

const isUserChatMember = computed(() => {
  return props.chat.members.some((u) => {
    const [username, uid] = userIdentifier.value.split('#');

    return `${u.username}#${u.public_uid}` === `${username}#${uid.toUpperCase()}`;
  })
})

async function handleUserInvite() {
  if (
    !isIdentifierValid.value
    || isUserChatMember.value
  ) return;

  const [username, uid] = userIdentifier.value.split('#');

  const res = await axios?.post<ChatRequest>(`/chats/${props.chat.id}/invite`, {
    receiverUsername: username,
    receiverUid: uid
  }, {
    headers: {
      Authorization: `Bearer ${userStore.tokens.access_token}`
    }
  }).catch(async (e: any) => {
    if (await checkTokenExpirationError(e)) {
      handleUserInvite();
      return;
    }
  });

  if (!res) return;

  userIdentifier.value = '';
  requestsStore.storeRequest(res.data, ChatRequestType.Sent);
}
</script>

<template>
  <v-dialog v-model="groupInviteDialog">
    <template v-slot:activator="{ props }">
      <v-btn size="small" variant="plain" icon="mdi-account-plus" :color="groupInviteDialog ? 'primary' : ''" v-bind="props" />
    </template>

    <v-card class="chat-dialog">
      <v-card-actions class="pb-1">
        <div>
          <v-card-title>
            Invite to {{props.chat.name}}
          </v-card-title>
        </div>
        <div class="ml-auto">
          <v-btn color="primary" icon="mdi-close" size="small" block @click="groupInviteDialog = false"></v-btn>
        </div>
      </v-card-actions>
      <v-divider />
      <v-card-item>
        <div class="mb-2">
          <h3>Invite to group</h3>
          <v-text-field
            v-model="userIdentifier"
            placeholder="Username#0000"
            :rules="[
              () => (isIdentifierValid || userIdentifier.length === 0) || 'Enter a valid user identifier',
              () => !isUserChatMember || 'User is already chat member'
            ]"
          >
            <template v-slot:label>
              <span>
                <v-icon icon="mdi-account" /> Enter a Username#0000
              </span>
            </template>

            <template v-slot:append>
              <v-btn
                @click="handleUserInvite"
                variant="text"
                rounded
                :disabled="!isIdentifierValid"
                size="small"
              >
                <v-icon icon="mdi-send" size="24" />
              </v-btn>
            </template>
          </v-text-field>
        </div>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>