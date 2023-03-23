<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import type { AxiosInstance } from "axios";
import { useRoute, useRouter } from "vue-router";

const axios = inject<AxiosInstance>("axios");
if (!axios) throw new Error("Axios injection failed")

const route = useRoute()
const router = useRouter()

let accountConfirmed = ref(false);

const confirmationToken = computed(() => {
  return route.params.token;
})

onMounted(async () => {
  const res = await axios.post(`/auth/confirm/${typeof confirmationToken.value === 'string' ? confirmationToken.value : confirmationToken.value[0]}`)
    .catch((e: any) => {

  });

  if (!res) return;

  accountConfirmed.value = true;

  setTimeout(() => {
    router.push({
      name: 'auth'
    })
  }, 5000);
})
</script>

<template>
<v-card v-if="accountConfirmed">
  <v-card-title>You email account has been confirmed</v-card-title>
  <v-card-text>
    You'll be redirected to a login page in a few seconds
  </v-card-text>
</v-card>
</template>

<style scoped>

</style>