<script setup lang="ts">
import Login from "@/components/auth/Login.vue";
import Register from "@/components/auth/Register.vue";
import { ref } from "vue";

const hasAccount = ref(true);
</script>

<template>
<v-container class="h-screen overflow-hidden">
  <v-row align="center" justify="center" class="auth-container">
    <v-col cols="12">
      <v-card>
        <Login @switch="hasAccount = false" v-if="hasAccount" />
        <Register @switch="hasAccount = true" v-if="!hasAccount" />
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>

<style scoped>
.auth-container {
  box-sizing: border-box;
  height: 100%;
}

:deep(.switch-text) {
  text-decoration: underline;
  color: slateblue;
  cursor: pointer;
  transition: all .2s ease;
}

:deep(.switch-text):hover {
  color: mediumslateblue;
  text-decoration: none;
}
</style>
