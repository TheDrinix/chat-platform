<template>
  <v-app class="h-screen">
    <v-main class="h-screen">
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions } from "pinia";
import { useUserStore } from "@/stores/user";

export default defineComponent({
  name: 'App',

  data () {
    return {
      //
    }
  },
  methods: {
    ...mapActions(useUserStore, ['loadTokens'])
  },
  created() {
    this.loadTokens();
  }
})
</script>
