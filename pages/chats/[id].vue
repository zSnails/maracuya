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
      <input class="file-input join-item" type="file" accept="image/*, video/*">
      <input ref="messageInput" type="text" v-model="messageContent" class="input flex-1 join-item w-full bg-base-200"
        :placeholder="`Message @${recipient?.peer?.email}`" required>
    </form>
  </div>
</template>
<script setup lang="ts">
import { type Message } from '~/message';
import type { Database } from '~/types/supabase';
import { formatDistance } from "date-fns";

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

const preloaded = await supabase.from("messages").select("*").eq("conversation", recipient?.id as number).order("created_at");
const messages = ref(preloaded.data);

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
