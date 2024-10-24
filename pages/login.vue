<template>
  <div class="flex flex-col items-center">
    <div class="m-auto flex shadow-xl flex-col gap-2 items-start bg-base-200 w-fit h-fit p-5 rounded-box">
      <h1 class="font-bold text-2xl">Log In</h1>
      <form @submit.prevent="login" class="form flex flex-col gap-5" action="">
        <div class="form-control flex flex-col gap-2">
          <label class="input input-bordered flex items-center gap-2">
            <EnvelopeIcon class="size-6" />
            <input v-model="loginInfo.email" type="email" class="grow" placeholder="Email" required />
          </label>
          <label class="input input-bordered flex items-center gap-2">
            <LockClosedIcon class="size-6" />
            <input v-model="loginInfo.password" type="password" class="grow" placeholder="Password" required />
          </label>
        </div>

        <div class="form-control">
          <button class="btn btn-primary" type="submit">Log In</button>
          <NuxtLink class="link" href="/register">Don't have an account?</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/vue/16/solid';

const { $emit } = useNuxtApp();

const supabase = useSupabaseClient();
const loginInfo = ref<{ email: string; password: string; }>({ email: '', password: '' });
const { replace } = useRouter();

const login = async () => {
  const user = await supabase.auth.signInWithPassword(loginInfo.value);
  if (user.data && user.data.user) {
    $emit("user:enter", user.data.user);
    await replace("/");
    return;
  }
  // TODO: show authentication errors
}
</script>
