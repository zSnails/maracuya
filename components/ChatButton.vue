<template>
  <NuxtLink @click.right.prevent="chatDelete.showModal()" ref="self"
    class="flex flex-row items-center justify-start gap-2 h-fit p-2" :href="`/chats/${id}`">
    <div class="avatar">
      <div class="w-10 rounded-full">
        <img v-if="user.img" :src="user.img" :alt="`${user.img}'s profile picture`">
        <img v-else
          src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
          alt="">
      </div>
    </div>
    <div class="text-2xl font-normal">
      <p v-if="meta.display_name">{{ meta.display_name }}</p>
      <p v-else-if="user.email">{{ user.email }}</p>
      <p v-else>[NAME]</p>
    </div>
    <dialog class="modal" ref="chatDelete" :id="`chat_delete_${user.id}`">
      <div class="modal-box flex flex-col items-center">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">
            <NoSymbolIcon class="size-6" />
          </button>
        </form>
        <button @click="() => deleteConversation(id)" class="text-white btn btn-wide btn-error">
          <TrashIcon class="size-6"></TrashIcon>
          Delete
        </button>
      </div>
    </dialog>
  </NuxtLink>
</template>
<script setup lang="ts">
import type { User } from '~/user';
import { NoSymbolIcon } from '@heroicons/vue/16/solid';
interface Meta {
  display_name?: string;
}

const chatDelete = ref<HTMLDialogElement>() as Ref<HTMLDialogElement>;

const deleteConversation = async (id: number) => {
  try {
    await $fetch(`/api/conversations/${id}`, { method: "DELETE" });
    window.location.reload();
  } catch (e) {
    console.error(e);
  }
};

const { user, id } = defineProps<{ user: User, id: number }>();
const meta = user.raw_user_meta_data as Meta;
</script>
