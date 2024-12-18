<template>
  <div class="grid grid-rows-[auto_1fr_auto] size-full">
    <nav class="navbar">
      <div class="flex-1">
        <div class="dropdown">
          <div role="button" tabindex="0" class="btn btn-ghost text-xl">{{ recipient?.peer?.email }}</div>
          <ul tabindex="0" class="menu z-[1] dropdown-content bg-base-100 rounded-box p-2 shadow">
            <button onclick="my_modal_3.showModal()" class="btn btn-sm btn-wide btn-error text-white">
              <!-- <button class="btn" onclick="my_modal_3.showModal()">open modal</button> -->
              <NoSymbolIcon class="size-4" />
              Block
            </button>
          </ul>
        </div>
      </div>
      <form @submit.prevent="searchMessage">
        <div class="form-control">
          <label for="search" class="input flex items-center gap-2">
            <input v-model="search" type="search" class="grow">
            <MagnifyingGlassIcon class="size-6" />
          </label>
        </div>
      </form>
    </nav>
    <section ref="messageArea" class="shadow-inner overflow-auto bg-base-300">
      <ChatBubble v-for="(msg, idx) in messages" :key="idx" :msg="msg" />
    </section>
    <form @submit.prevent="sendMessage" class="join m-5" ref="messageForm">
      <input ref="attachment" class="file-input join-item bg-base-200" name="media" type="file"
        accept="image/*, video/*">
      <div class="input flex items-center justify-between join-item bg-base-200 w-full">
        <input ref="messageInput" type="text" name="content" v-model="messageContent" class="flex-1"
          :placeholder="`Message @${recipient?.peer?.email}`">
        <span v-if="sending" class="loading loading-spinner"></span>
        <PaperAirplaneIcon v-else class="size-6" />
      </div>
    </form>
    <dialog id="my_modal_3" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <XMarkIcon class="size-6"></XMarkIcon>
          </button>
        </form>
        <h3 class="text-lg font-bold">Are you sure you wish to block this user?</h3>
        <div class="flex flex-col items-center">
          <div class="flex flex-row items-center gap-2">
            <button class="btn" onclick="my_modal_3.close()">Cancel</button>
            <button class="btn btn-error text-white" @click="blockUser">Confirm</button>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>
<script setup lang="ts">
import { type Message } from '~/message';
import type { Database } from '~/types/supabase';
import { PaperAirplaneIcon, MagnifyingGlassIcon, NoSymbolIcon, XMarkIcon } from '@heroicons/vue/16/solid';

const search = ref<string | null>(null);
const sending = ref(false);
const messageArea = ref<HTMLTableSectionElement>() as Ref<HTMLTableSectionElement>;
const messageForm = ref<HTMLFormElement>() as Ref<HTMLFormElement>;
const attachment = ref<HTMLInputElement>() as Ref<HTMLInputElement>;
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

const blockUser = async () => {
  try {
    await $fetch(`/api/users/${recipient?.peer?.id}/block`, { method: "POST" });
    // @ts-expect-error my_modal_3 exists at runtime
    my_modal_3.close();
  } catch (e) {
    console.error(e);
  }
};

const searchMessage = async () => {
  if (search.value) {
    for (const node of messageArea.value.childNodes) {
      if (node.textContent?.toLowerCase().includes(search.value?.toLowerCase())) {
        //messageArea.value.scrollIntoView
        (node as HTMLElement).scrollIntoView();
      }
    }
  }
};

const messageContent = ref("");
const supabase = useSupabaseClient<Database>();
const sendMessage = async (event: Event) => {
  if (sending.value) return;
  const formData = new FormData(event.target as HTMLFormElement);
  try {
    sending.value = true
    await $fetch(`/api/conversations/${route.params.id}/send`, {
      method: "POST",
      body: formData
    });
    messageContent.value = "";
    messageForm.value.reset();
  } catch (error: any) {
    console.error(error);
  }
  sending.value = false;
};

const preloaded = await useFetch(`/api/conversations/${route.params.id}/messages`)
const messages = ref(preloaded.data.value?.data);

const res = supabase.channel('schema-db-changes') // TODO: this should be placed on the server
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

/*supabase.channel('schema-db-changes') // TODO: this should be placed on the server
  .on(
    'postgres_changes',
    {
      event: 'DELETE',
      schema: 'public',
      table: 'messages',
      filter: `conversation=eq.${route.params.id}`,
    },
    (payload) => {
      const scroll = (messageArea.value.scrollTop + messageArea.value.offsetHeight) / messageArea.value.scrollHeight;
      const msg = (payload.old as Message);
      //messages.value?.push(payload.old as Message);
      const idx = messages.value?.findIndex((e) => e.id === msg.id);
      if (idx) {
        messages.value?.splice(idx, 1);
      }

      //if (scroll >= 0.9) {
      //  nextTick(() => {
      //    messageArea.value.scroll({
      //      top: messageArea.value.scrollHeight + 64,
      //      behavior: "smooth",
      //    });
      //  });
      //}

    }
  )
  .subscribe(); */

onMounted(() => {
  messageArea.value.scrollTop = messageArea.value.scrollHeight;
});
</script>
