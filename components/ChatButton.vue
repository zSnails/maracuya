<template>
  <NuxtLink class="flex flex-row items-center justify-start gap-2 h-fit p-2" :href="`/chats/${id}`">
    <div class="avatar">
      <div class="w-10 rounded-full">
        <img v-if="img" :src="img" :alt="`${email}'s profile picture`">
        <img v-else
          src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
          alt="">
      </div>
    </div>
    <div class="text-2xl font-normal">
      <p v-if="email">{{ email }}</p>
      <p v-else>[NAME]</p>
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
import type { User } from '~/user';

const { id, email, img } = defineProps<User>();
</script>
