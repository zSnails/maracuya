<template>
  <div :id="`${message.sent_by}-${message.sent_to}-${message.id}`"
    class="rounded-box bg-base-200 p-5 m-2 flex flex-row items-start justify-between"
    :class="{ 'animate-pulse': !!!message.id }">
    <div class="flex flex-row">
      <!-- <div class="avatar">
        <img src="" alt="">
      </div> -->
      <section class="flex flex-col items-start">
        <h1 class="text-xl font-bold">{{ message.sent_by }}</h1>
        <p>{{ message.content }}</p>
        <div v-if="message.media">
          <img :src="message.media" class="rounded-xl" alt="">
        </div>
      </section>
    </div>
    <section v-if="deletable">
      <button class="btn btn-xs hover:btn-error">
        <XMarkIcon class="size-6" />
      </button>
    </section>
  </div>
</template>
<script setup lang="ts">
import { type Message } from '~/message';
import { XMarkIcon } from '@heroicons/vue/16/solid';
const { message } = defineProps<{ message: Message, deletable: boolean }>();
</script>
