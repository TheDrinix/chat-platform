<script setup lang="ts">
import { inject, Ref, ref } from "vue";
import { useUserStore } from "@/stores/user";
import type { AxiosInstance } from "axios";
import type { AuthResponseData } from "@/interfaces/user";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const axios = inject<AxiosInstance>('axios');
const router = useRouter();

if (!axios) {
  throw new Error('Axios injection failed');
}

const emit = defineEmits<{
  (e: 'switch'): void
}>()

let email = ref('');
let password = ref('');
let err: Ref<any>;

const handleLogin = async () => {
  err = ref()

  const body = {
    email: email.value,
    password: password.value
  }

  try {
    const res = await axios.post<AuthResponseData>('/auth/login', body);

    console.log(res.data)

    userStore.storeAuthData(res.data);
  } catch(e: any) {
    console.error(e);

    err = ref(e)

    return;
  }

  router.push('/chats')
}
</script>

<template>
  <v-card-title>Login</v-card-title>
  <v-card-subtitle v-if="err">{{err}}</v-card-subtitle>
  <v-card-text>
    <v-form @submit.prevent="handleLogin">
      <v-text-field color="primary" type="text" name="email" label="Email" v-model="email" />
      <v-text-field color="primary" type="password" name="password" label="Password" v-model="password" />
      <v-row no-gutters class="mb-2">
        <span class="text-subtitle-2">Don't have an account? <a class="switch-text" @click="emit('switch')">Sign up here</a></span>
      </v-row>
      <v-btn color="primary" type="submit">Login</v-btn>
    </v-form>
  </v-card-text>
</template>

<style scoped></style>