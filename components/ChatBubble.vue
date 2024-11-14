<template>
  <div ref="self" :id="`${msg.sent_by}-${msg.conversation}-${msg.id}`" class="chat"
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
    <div v-if="msg.sent_by === user?.id && msg.content" :onclick="`deletion_modal_${msg.id}.showModal()`"
      class="chat-bubble">{{ msg.content }}</div>
    <div v-else-if="msg.content" class="chat-bubble" v-if="msg.content">{{ msg.content
      }}
    </div>
    <!-- <button class="btn" @click.right.prevent="`deletion_modal_${msg.id}.showModal()`">open modal</button> -->
    <div class="chat-footer">
      {{ formatDistance(msg.created_at, new Date(), { addSuffix: true }) }}
    </div>
    <dialog v-if="msg.media" :id="`img_${msg.id}_modal`" class="modal">
      <img class="modal-box" :src="msg.media">
    </dialog>

    <dialog :id="`deletion_modal_${msg.id}`" v-if="msg.sent_by === user?.id" class="modal">
      <div class="modal-box flex flex-col items-center">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <button @click="() => deleteMessage(msg.id.toString())" class="text-white btn btn-wide btn-error">
          <TrashIcon class="size-6"></TrashIcon>
          Delete
        </button>
      </div>
    </dialog>

  </div>
</template>
<script setup lang="ts">
import { formatDistance } from 'date-fns';
import { TrashIcon } from '@heroicons/vue/16/solid';
import type { Message } from '~/message';

const self = ref<HTMLDivElement>() as Ref<HTMLDivElement>;
const video = ref(false);
const loading = ref(true);
const loaded = () => {
  loading.value = false;
};

const deleteMessage = async (id: string) => {
  try {
    await $fetch(`/api/messages/${id}`, { method: "DELETE" });
    self.value.remove();
  } catch (e) {
    console.error(e);
  }
};

const user = useSupabaseUser();
const { msg } = defineProps<{ msg: Message, key: number }>();
</script>
