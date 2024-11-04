<template>
  <div :id="`${msg.sent_by}-${msg.conversation}-${msg.id}`" class="chat"
    :class="{ 'chat-start': msg.sent_by !== user?.id, 'chat-end': msg.sent_by === user?.id }">
    <div v-if="msg.media" class="chat-header">
      <div v-if="loading"
        class="flex items-center justify-center w-48 h-28 object-scale-down rounded-xl bg-placeholder-primary">
        <p class="loading"></p>
      </div>
      <img v-show="!loading && !video" :onclick="`img_${msg.id}_modal.showModal()`"
        class="object-scale-down w-48 rounded-xl hover:animate-pulse" :src="msg.media" alt="Some Media" @load="loaded"
        @error="video = true; loaded()">
      <video v-show="video" class="rounded-xl" controls width="480">
        <source :src="msg.media" type="video/mp4">
      </video>
    </div>
    <div class="chat-bubble" v-if="msg.content">{{ msg.content }}</div>
    <div class="chat-footer">
      {{ formatDistance(msg.created_at, new Date(), { addSuffix: true }) }}
    </div>
    <dialog v-if="msg.media" :id="`img_${msg.id}_modal`" class="modal">
      <img class="modal-box" :src="msg.media">
    </dialog>
  </div>
</template>
<script setup lang="ts">
import { formatDistance } from 'date-fns';
import type { Message } from '~/message';

const video = ref(false);
const loading = ref(true);
const loaded = () => {
  loading.value = false;
};

const user = useSupabaseUser();
const { msg } = defineProps<{ msg: Message, key: number }>();
</script>
