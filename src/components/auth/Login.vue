<script setup lang="ts">
import { inject, Ref, ref } from "vue";
import { useUserStore } from "@/stores/user";
import type { AxiosInstance, AxiosError } from "axios";
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
let err: Ref<string> = ref('');

const handleLogin = async () => {
  err.value = '';

  const body = {
    email: email.value,
    password: password.value
  }

  try {
    const res = await axios.post<AuthResponseData>('/auth/login', body);

    console.log(res.data)

    userStore.storeAuthData(res.data);
  } catch(e: any | AxiosError) {
    if (e.response.status === 401) {
      err.value = e.response.data.message;
    }

    return;
  }

  router.push('/chats')
}
</script>

<template>
  <v-card-title>Login</v-card-title>
  <v-card-subtitle v-if="err" class="text-red-lighten-1" style="opacity: 1">{{err}}</v-card-subtitle>
  <v-card-text>
    <v-form @submit.prevent="handleLogin">
      <v-text-field color="primary" type="text" name="email" label="Email" v-model="email" :rules="[
        v => !!v || 'Enter your email',
        v => /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm.test(v) || 'Enter valid email',
      ]" />
      <v-text-field color="primary" type="password" name="password" label="Password" v-model="password" :rules="[
        v => !!v || 'Enter your password',
      ]" />
      <v-row no-gutters class="mb-2">
        <span class="text-subtitle-2">Don't have an account? <a class="switch-text" @click="emit('switch')">Sign up here</a></span>
      </v-row>
      <v-btn color="primary" type="submit">Login</v-btn>
    </v-form>
  </v-card-text>
</template>

<style scoped></style>