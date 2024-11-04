<template>
  <div class="flex flex-col items-center">
    <div class="m-auto flex shadow-xl flex-col gap-2 items-start bg-base-200 w-fit h-fit p-5 rounded-box">
      <h1 class="font-bold text-2xl">Sign Up</h1>
      <form @submit.prevent="login" class="form flex flex-col gap-5" action="">
        <div class="form-control flex flex-col gap-2">
          <label class="input input-bordered flex items-center gap-2" :class="{ 'input-error': !!error }">
            <EnvelopeIcon class="size-6" />
            <input v-model="loginInfo.name" autocomplete="name" type="text" class="grow" placeholder="User Name"
              required />
          </label>
          <label class="input input-bordered flex items-center gap-2" :class="{ 'input-error': !!error }">
            <EnvelopeIcon class="size-6" />
            <input v-model="loginInfo.email" autocomplete="email" type="email" class="grow" placeholder="Email"
              required />
          </label>
          <label class="input input-bordered flex items-center gap-2" :class="{ 'input-error': !!error }">
            <LockClosedIcon class="size-6" />
            <input v-model="loginInfo.password" autocomplete="current-password" type="password" class="grow"
              placeholder="Password" required />
          </label>
        </div>
        <p v-if="error" class="text-error">{{ error.message }}</p>

        <div class="form-control">
          <button class="btn btn-primary" type="submit">
            <ArrowRightEndOnRectangleIcon class="size-6" /> Sign Up
          </button>
          <NuxtLink class="link" href="/login">Already have an account?</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { AuthError } from "@supabase/supabase-js";
import { LockClosedIcon, EnvelopeIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/vue/16/solid';

const loginInfo = ref<{ email: string; password: string; name: string; }>({ email: '', password: '', name: '' });
const { replace } = useRouter();

const error = ref<AuthError | null>(null);

const login = async () => {
  error.value = null;
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: loginInfo.value
    });
    await replace("/login");
  } catch (_err: any) {
    const err = (_err as AuthError);
    console.error(err);
    error.value = err;
  }
}
</script>
