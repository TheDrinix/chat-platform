<script setup lang="ts">
  import type { User } from "@/interfaces/user";
  import { computed, inject } from "vue";
  import defaultUserPfpUrl from "@/assets/images/default_user_pfp.png"
  import { useUserStore } from "@/stores/user";
  import type { AxiosInstance } from "axios";
  import { checkTokenExpirationError } from "@/helpers";

  const userStore = useUserStore();

  const axios = inject<AxiosInstance>('axios');

  if (!axios) throw new Error('Axios injection failed');

  const serverUrl = import.meta.env["VITE_SERVER_URL"];

  const props = defineProps<{
    member: User,
    chatId: number,
    isUserChatOwner: boolean
  }>();

  const memberPfpUrl = computed(() => {
    return props.member.pfpUrl
      ? `${serverUrl}${props.member.pfpUrl}`
      : defaultUserPfpUrl;
  });

  // TODO: Handle response data somehow lol
  const handleOwnershipTransfer = async () => {
    try {
      const token = userStore.tokens.access_token;

      const res = await axios.patch(`/chats/${props.chatId}/transfer/${props.member.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (e: any) {
      if (await checkTokenExpirationError(e)) {
        handleOwnershipTransfer();
        return;
      }
    }
  }

  const handleMemberKick = async () => {
    try {
      const token = userStore.tokens.access_token;

      const res = await axios.patch(`/chats/${props.chatId}/kick/${props.member.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (e: any) {
      if (await checkTokenExpirationError(e)) {
        handleMemberKick();
        return;
      }
    }
  }
</script>

<template>
  <div class="member">
    <div class="member-avatar">
      <img :src="memberPfpUrl" alt="">
    </div>
    <div class="member-name">
      {{member.username}}#{{member.public_uid}}
    </div>
    <div class="member-actions" v-if="isUserChatOwner && member.id !== userStore.user.id">
      <v-tooltip text="Transfer ownership" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="plain" icon="mdi-autorenew" size="small" color="warning" v-bind="props" @click="handleOwnershipTransfer" />
        </template>
      </v-tooltip>
      <v-tooltip text="Kick member" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="plain" icon="mdi-cancel" size="small" color="error" v-bind="props" @click="handleMemberKick" />
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<style scoped>
  .member {
    display: flex;
    align-items: center;
  }

  .member-avatar img {
    aspect-ratio: 1 / 1;
    max-height: 2.5rem;
    vertical-align: bottom;
  }

  .member-name {
    display: inline-block;
    padding: 0.5rem;
  }

  .member-actions {
    margin-left: auto;
  }
</style>