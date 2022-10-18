<script setup lang="ts">
import { MessageType } from "../interfaces/messageType";

defineProps<{
  messages: Array<MessageType>;
}>()

</script>

<template>
  <h2>Messages</h2>
  <!-- format as cards, add timestamp -->
  <p v-for="message in messages" :class="message.premium ? 'is-premium' : ''">
    <strong>{{ message.sender }}</strong>:<br />
    {{ message.text }}
  </p>
</template>
