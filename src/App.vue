<template>
  <v-app class="min-h-screen">
    <v-main class="min-h-screen">
      <Suspense>
        <router-view/>
      </Suspense>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapStores } from "pinia";
import { useUserStore } from "@/stores/user";
import { useChatRequestsStore } from "@/stores/requests";

export default defineComponent({
  name: 'App',

  data () {
    return {
      //
    }
  },
  computed: {
    ...mapStores(useUserStore)
  },
  methods: {
    ...mapActions(useUserStore, ['loadLoggedInUserData'])
  },
  async created() {
    await this.loadLoggedInUserData();
  }
})
</script>

<style>
/* ===== Scrollbar CSS ===== */
/* Firefox */
* {
  scrollbar-width: auto;
  /*noinspection CssUnresolvedCustomProperty*/
  scrollbar-color: rgb(var(--v-theme-primary));;
}

/* Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 12px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: rgb(var(--v-theme-primary));
  border-radius: 10px;
}

body::-webkit-scrollbar {
  display: none;
}
</style>