<template>
  <main class="flex flex-row h-[100dvh] bg-base-100">
    <aside v-if="user" class="grid grid-rows-[auto_1fr_auto] h-full  rounded-box bg-base-200 w-[350px]">
      <h1 class="text-5xl font-bold m-5">Maracuyá</h1>
      <ul class="join menu w-full flex flex-col gap-1">
        <li v-if="chats" v-for="(chat, idx) in chats" :key="chat?.peer?.id as string" class="w-full">
          <ChatButton @click="selected = idx + 1" :class="{ active: idx + 1 === selected }"
            :email="chat?.peer?.email as string" :id="chat?.id" />
        </li>
      </ul>
      <section class="flex flex-row items-center justify-between rounded-box bg-base-300 p-2">
        <NuxtLink class="btn p-2 border-transparent bg-base-300" href="/me">{{ user.email }}</NuxtLink>
        <NuxtLink class="btn p-2" href="/settings">
          <Cog6ToothIcon class="size-6 hover:animate-spin" />
        </NuxtLink>
      </section>
    </aside>
    <NuxtPage v-if="selected && chats" class="flex-1" :data="chats[selected - 1]" />
    <NuxtPage v-else-if="!user" class="flex-1" />
  </main>
</template>
<script setup lang="ts">
import ChatButton from '~/components/ChatButton.vue';
import { Cog6ToothIcon } from '@heroicons/vue/16/solid';
import type { Database } from '~/types/supabase';
import { type User } from "@supabase/supabase-js";

const { $listen } = useNuxtApp();
const user = useSupabaseUser();
const client = useSupabaseClient<Database>();

const loadChats = async () => {
  const tmpChats = await client
    .from("conversations")
    .select("id, created_at, peer_a:users!conversations_peer_a_fkey(id, email), peer_b:users!conversations_peer_b_fkey(id, email)")
    .or(`peer_a.eq.${user.value?.id},peer_b.eq.${user.value?.id}`);

  return tmpChats.data?.map((elem) => {
    if (elem.peer_a?.id === user.value?.id)
      return { id: elem.id, peer: elem.peer_b };
    return { id: elem.id, peer: elem.peer_a };
  });
};


const chats = ref<{
  id: number;
  peer: {
    id: string | null;
    email: string | null;
  } | null;
}[]>();

if (user.value) {
  chats.value = await loadChats();
}

$listen("user:enter", async (usr: User) => {
  user.value = usr;
  chats.value = await loadChats();
});

const selected = ref<number>(0);

</script>
