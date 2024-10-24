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
        <div class="dropdown dropdown-top">
          <div tabindex="0" role="button" class="btn m-1">
            <UserIcon class="size-6" />{{ user.email }}
          </div>
          <ul tabindex="0" class="dropdown-content menu rounded-box bg-base-100">
            <li><button @click="signOut" class="btn btn-error btn-sm btn-wide text-white">
                <ArrowRightStartOnRectangleIcon class="size-6" />Log Off
              </button></li>
          </ul>
        </div>
        <NuxtLink class="btn btn-square p-2" href="/settings">
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
import { Cog6ToothIcon, UserIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/vue/16/solid';
import type { Database } from '~/types/supabase';
import { type User } from "@supabase/supabase-js";

const { $listen, $emit } = useNuxtApp();
const { replace } = useRouter();
const user = useSupabaseUser();
const supabase = useSupabaseClient<Database>();

const signOut = async () => {
  if (user.value) {
    await supabase.auth.signOut({ scope: 'global' });
    $emit("user:exit", user.value);
    await replace("/login");
  }
};

const fromDb = await useFetch("/api/me");
const chats = ref(fromDb.data.value?.data);

$listen("user:enter", async (usr: User) => {
  user.value = usr;
  const resp = await $fetch("/api/me");
  chats.value = resp.data;
});

const selected = ref<number>(0);

</script>
