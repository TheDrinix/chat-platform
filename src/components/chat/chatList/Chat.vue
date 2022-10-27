<script setup lang="ts">

</script>

<template>
<div class="chat-item">
  <img src="https://via.placeholder.com/512" alt="group" class="chat-logo">
  <p class="chat-title">Chat</p>
</div>
</template>

<style scoped>
.chat-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  width: 100%;
}

.chat-title {
  padding-left: .5rem;
  font-size: 1.5rem;
}

.chat-logo {
  height: 3rem;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
}
</style>