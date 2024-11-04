<template>
  <div class="p-5">
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

          <div class="form-control">
            <button class="btn btn-primary" type="submit">
              <ArrowUpOnSquareIcon class="size-6" /> Update
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { CreditCardIcon, EnvelopeIcon, ArrowUpOnSquareIcon } from '@heroicons/vue/16/solid';
const user = useSupabaseUser();
const oldName = user.value?.user_metadata.display_name;
const oldEmail = user.value?.email as string;
const name = ref(oldName || "");
console.log(name.value);
const email = ref(oldEmail);

const { $emit } = useNuxtApp();

const doUpdate = async () => {
  try {
    const response = await $fetch("/api/me", {
      method: "PUT", body: {
        name: name.value, email: email.value
      }
    });
    $emit("user:enter", response.data.user);
  } catch (error) {
    console.error(error);
  }
};

</script>
