<template>
  <div class="grid grid-rows-[auto_1fr_auto] size-full">
    <nav class="navbar">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">{{ recipient?.peer?.email }}</a>
      </div>
    </nav>
    <section ref="messageArea" class="shadow-inner overflow-auto bg-base-300">
      <div v-for="(msg, idx) in messages" :key="idx" class="chat"
        :class="{ 'chat-start': msg.sent_by !== user?.id, 'chat-end': msg.sent_by === user?.id }">
        <div v-if="msg.media" class="chat-header">
          <img class="object-scale-down w-48 rounded-xl" :src="msg.media" alt="Some Media">
        </div>
        <div class="chat-bubble">{{ msg.content }}</div>
        <div class="chat-footer">
          {{ formatDistance(msg.created_at, new Date(), { addSuffix: true }) }}
        </div>
      </div>
    </section>
    <form @submit.prevent="sendMessage" class="join m-5">
      <input class="file-input join-item bg-base-200" type="file" accept="image/*, video/*">
      <div class="input flex items-center justify-between join-item bg-base-200 w-full">
        <input ref="messageInput" type="text" v-model="messageContent" class="flex-1"
          :placeholder="`Message @${recipient?.peer?.email}`" required>
        <PaperAirplaneIcon class="size-6" />
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { type Message } from '~/message';
import type { Database } from '~/types/supabase';
import { formatDistance } from "date-fns";
import { PaperAirplaneIcon } from '@heroicons/vue/16/solid';

const messageArea = ref<HTMLTableSectionElement>() as Ref<HTMLTableSectionElement>;
const messageInput = ref<HTMLInputElement>() as Ref<HTMLInputElement>;
const route = useRoute();

export interface Root {
  id?: number
  peer?: Peer
}

export interface Peer {
  id?: string
  email?: string
}

const recipient = useAttrs().data as Root | null;
const user = useSupabaseUser();

const messageContent = ref("");
const supabase = useSupabaseClient<Database>();
const sendMessage = async () => {
  if (messageContent.value.length === 0) return;
  messageInput.value.disabled = true;
  try {
    await $fetch(`/api/conversations/${route.params.id}/send`, {
      method: "POST",
      body: {
        content: messageContent.value
      }
    });
    messageContent.value = "";
  } catch (error) {
    console.error(error);
  }
  messageInput.value.disabled = false;
};

const preloaded = await useFetch(`/api/conversations/${route.params.id}/messages`)
const messages = ref(preloaded.data.value?.data);

supabase.channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation=eq.${route.params.id}`,
    },
    (payload) => {
      const scroll = (messageArea.value.scrollTop + messageArea.value.offsetHeight) / messageArea.value.scrollHeight;
      messages.value?.push(payload.new as Message);

      if (scroll >= 0.9) {
        nextTick(() => {
          messageArea.value.scroll({
            top: messageArea.value.scrollHeight + 64,
            behavior: "smooth",
          });
        });
      }
    }
  )
  .subscribe();
onMounted(() => {
  messageArea.value.scrollTop = messageArea.value.scrollHeight;
});
</script>
