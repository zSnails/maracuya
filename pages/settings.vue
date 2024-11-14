<template>
  <div class="p-5 flex flex-col gap-4">
    <div class="card bg-base-200">
      <div class="card-body">
        <h1 class="text-2xl font-bold">Profile Settings</h1>
        <form @submit.prevent="doUpdate" action="" class="form flex flex-col gap-5">
          <div class="form-control flex flex-col gap-2">
            <label class="input input-bordered flex items-center gap-2">
              <CreditCardIcon class="size-6" />
              <input type="text" autocomplete="name" class="grow" :placeholder="oldName" v-model="name" required />
            </label>
            <label class="input input-bordered flex items-center gap-2">
              <EnvelopeIcon class="size-6" />
              <input type="email" autocomplete="email" class="grow" :placeholder="oldEmail" v-model="email" required />
            </label>
          </div>
          <p v-if="error" class="text-error">{{ error.message }}</p>

          <div class="form-control">
            <button class="btn btn-primary" :disabled="loading" type="submit">
              <span class="loading loading-spinner" v-if="loading"></span>
              <ArrowUpOnSquareIcon v-else class="size-6" /> Update
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card bg-base-200">
      <div class="card-body">
        <h1 class="text-2xl font-bold">Blocked Users</h1>
        <ul>
          <li :data-id="block.id" :id="block.id.toString()" v-for="(block) in blocked" :key="block.id">
            <button @click="() => unblock(block.id, block.blocked_user_id as string)"
              class="inline-flex flex-row text-white items-center btn btn-error btn-xs btn-circle">
              <NoSymbolIcon class="size-4" />
            </button>
            {{ block.blocked_user_id }} - {{ formatDistanceToNow(block.created_at, { addSuffix: true }) }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { CreditCardIcon, EnvelopeIcon, ArrowUpOnSquareIcon, NoSymbolIcon } from '@heroicons/vue/16/solid';
import { formatDistanceToNow } from 'date-fns';

const user = useSupabaseUser();
const oldName = user.value?.user_metadata.display_name;
const oldEmail = user.value?.email as string;
const name = ref(oldName || "");
const email = ref(oldEmail);

const error = ref<Error | null>(null);
const loading = ref(false);


async function unblock(id: number, userId: string) {
  try {
    await $fetch(`/api/users/${userId}/block`, {
      method: "DELETE",
      body: {
        id: id
      }
    });
    const elem = document.getElementById(id.toString());
    elem?.remove();
  } catch (e) {
    console.error(e);
  }
}

const { $emit } = useNuxtApp();

const { data: blocked } = useFetch("/api/me/blocked");

const doUpdate = async () => {
  loading.value = true;

  try {
    const response = await $fetch("/api/me", {
      method: "PUT", body: {
        name: name.value, email: email.value
      }
    });
    $emit("user:enter", response.data.user);
  } catch (err: any) {
    console.error(err);
    error.value = err;
  }

  loading.value = false;
};

</script>
