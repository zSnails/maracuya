<template>
  <main class="flex flex-row h-[100dvh] bg-base-100">
    <aside v-if="user" class="grid grid-rows-[auto_1fr_auto] h-full  rounded-box bg-base-200 w-[350px]">
      <h1 class="text-5xl font-bold m-5">Maracuyá</h1>
      <ul class="join menu w-full flex flex-col gap-1 items-center">
        <li v-if="chats" v-for="(chat, idx) in chats" :key="chat?.peer?.id as string" class="w-full">
          <ChatButton @click="selected = idx + 1" :class="{ active: idx + 1 === selected }" :user="chat.peer as any"
            :id="chat?.id" />
        </li>
        <li>
          <button onclick="newchatModal.showModal()" class="btn btn-primary btn-wide">
            <PlusIcon class="size-6"></PlusIcon>
          </button>
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
    <NuxtPage v-else class="flex-1" />
    <dialog id="newchatModal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <XMarkIcon class="size-6" />
          </button>
        </form>

        <form @submit.prevent="startChat" class="m-5">
          <div class="form-control flex flex-col gap-2">
            <label for="email" class="input input-bordered flex items-center gap-2" :class="{ 'input-error': !!error }">
              <EnvelopeIcon class="size-6" />
              <input type="email" name="email" class="grow" required placeholder="example@email.com" />
            </label>
            <button class="btn btn-primary" type="submit">Start Chat</button>
          </div>
          <p v-if="error" class="text-error">{{ error.message }}</p>
        </form>
      </div>
    </dialog>
  </main>
</template>
<script setup lang="ts">
import ChatButton from '~/components/ChatButton.vue';
import { Cog6ToothIcon, UserIcon, PlusIcon, EnvelopeIcon, ArrowRightStartOnRectangleIcon, XMarkIcon } from '@heroicons/vue/16/solid';
import { type User } from "@supabase/supabase-js";

const error = ref<Error | null>(null);
const { $listen, $emit } = useNuxtApp();
const user = useSupabaseUser();

const startChat = async (event: Event) => {
  const body = new FormData(event.target as HTMLFormElement);
  try {
    const response = await $fetch('/api/conversations/create', {
      method: "POST",
      body
    });

    // @ts-expect-error object is not indeed infinite
    chats.value?.push(response);
    // @ts-expect-error newchatModal IS defined, its only defined at runtime and not compile time
    newchatModal.close();
  } catch (e: any) {
    console.error(e);
    error.value = e;
  }
};

const signOut = async () => {
  if (user.value) {
    try {
      await $fetch("/api/auth/signout");
      $emit("user:exit", user.value);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
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
