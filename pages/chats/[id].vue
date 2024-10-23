<template>
  <div class="grid grid-rows-[auto_1fr_auto] size-full">
    <nav class="navbar">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">{{ recipient?.peer?.email }}</a>
      </div>
    </nav>
    <!-- <section class="w-full max-h-full shadow-inner overflow-auto bg-base-300"> -->
    <section ref="messageArea" class="shadow-inner overflow-auto bg-base-300">
      <div v-for="(msg, idx) in messages" :key="idx" class="chat"
        :class="{ 'chat-start': msg.sent_by !== user?.id, 'chat-end': msg.sent_by === user?.id }">
        <div class="chat-bubble">{{ msg.content }}</div>
        <div v-if="msg.media" class="chat-footer">
          <img class="object-scale-down w-48 rounded-xl" :src="msg.media" alt="Some Media">
        </div>
      </div>
    </section>
    <form @submit.prevent class="join m-5">
      <input class="file-input join-item" type="file" accept="image/*, video/*">
      <input type="text" v-model="messageContent" class="input join-item w-full bg-base-200"
        :placeholder="`Message @${recipient?.peer?.email}`" required>
      <button type="submit" class="btn join-item" :class="{ 'btn-disabled': messageContent.length === 0 }"
        @click="sendMessage">
        <PaperAirplaneIcon class="size-6 fg-base-200"></PaperAirplaneIcon>
      </button>
    </form>
  </div>
</template>
<script setup lang="ts">
import { type Message } from '~/message';
import { PaperAirplaneIcon } from '@heroicons/vue/16/solid';
import type { Database } from '~/types/supabase';

const messageArea = ref<HTMLTableSectionElement>();

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
  const resp = await supabase.from("messages").insert(
    {
      sent_by: user.value?.id as string,
      conversation: recipient?.id,
      content: messageContent.value,
    }
  );
  if (resp.error) {
    console.error(resp.error);
  } else {
    messageContent.value = "";
  }
};

console.log('recipient.id', recipient?.id);
const preloaded = await supabase.from("messages").select("*").eq("conversation", recipient?.id as number).order("created_at");
const messages = ref(preloaded.data);
console.log(messages.value);

supabase.channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => messages.value?.push(payload.new as Message)
  )
  .subscribe();
</script>
