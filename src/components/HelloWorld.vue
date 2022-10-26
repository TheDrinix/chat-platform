<script setup lang="ts">
import { ref } from "vue";

let name = ref("");
let email = ref("");
let password = ref("");

const register = () => {
  console.log(name.value);
  console.log(email.value);
  console.log(password.value);
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="6" class="mx-auto">
        <v-form>
          <v-text-field
            v-model="name"
            label="Name"
            outlined
            dense
            required
          ></v-text-field>
          <v-text-field
            v-model="email"
            label="Email"
            outlined
            dense
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            outlined
            dense
            required
          ></v-text-field>
          <v-btn color="primary" class="mt-5" @click="register">Register</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
