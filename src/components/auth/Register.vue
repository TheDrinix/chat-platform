<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { inject, ref } from "vue";
import { AxiosInstance } from "axios";
import type { AuthResponseData } from "@/interfaces/user";

const userStore = useUserStore();
const axios = inject<AxiosInstance>('axios')

if (!axios) {
  throw new Error('Axios injection failed');
}

const emit = defineEmits<{
  (e: 'switch'): void
}>()

let username = ref('');
let email = ref('');
let password = ref('');

const handleRegister = async () => {
  const body = {
    username: username.value,
    email: email.value,
    password: password.value
  }

  try {
    const res = await axios.post<AuthResponseData>('/auth/register', body);

    userStore.storeAuthData(res.data);
  } catch (e: any) {
    console.error(e);
  }
}
</script>

<template>
  <v-card-title>Register</v-card-title>
  <v-card-text>
    <v-form @submit.prevent="handleRegister">
      <v-text-field color="primary" type="text" name="username" label="Username" v-model="username" />
      <v-text-field color="primary" type="text" name="email" label="Email" v-model="email" />
      <v-text-field color="primary" type="password" name="password" label="Password" v-model="password" />
      <v-row no-gutters class="mb-2">
        <span class="text-subtitle-2">Already have an account? <a class="switch-text" @click="emit('switch')">Sign in here</a></span>
      </v-row>
      <v-btn color="primary" type="submit">Register</v-btn>
    </v-form>
  </v-card-text>
</template>

<style scoped></style>