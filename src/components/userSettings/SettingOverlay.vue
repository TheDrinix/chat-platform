<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  title: string;
}>()

const dialog = ref(false);
</script>

<template>
  <v-dialog
    v-model="dialog"
  >
    <template v-slot:activator="{ props }">
      <slot name="activator" :props="props"></slot>
    </template>

    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-item>
        <slot></slot>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>