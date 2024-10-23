<template>
  <div class="grid grid-rows-[auto_1fr_auto] size-full">
    <nav class="navbar">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">{{ recipient?.peer?.email }}</a>
      </div>
    </nav>
    <section class="w-full max-h-full shadow-inner overflow-auto bg-base-300">
      <MessageBlock v-for="(msg, idx) in messages" :key="idx" :message="msg" :deletable="msg.sent_by === user?.id" />
    </section>
    <div class="join m-5">
      <input type="text" v-model="messageContent" class="input join-item w-full bg-base-200"
        :placeholder="`Message @${recipient?.peer?.email}`">

      <button type="submit" class="btn join-item" @click="sendMessage">
        <PaperAirplaneIcon class="size-6 fg-base-200"></PaperAirplaneIcon>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { type Message } from '~/message';
import MessageBlock from '~/components/MessageBlock.vue';
import { PaperAirplaneIcon } from '@heroicons/vue/16/solid';
import type { Database } from '~/types/supabase';

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
