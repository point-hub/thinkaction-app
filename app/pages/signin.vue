<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://thinkaction.id/signin' },
  ],
});

useSeoMeta({
  title: 'Sign In | Thinkaction',
  description: 'Access your Thinkaction account to continue tracking your goals and ideas.',
  ogTitle: 'Sign In | Thinkaction',
  ogType: 'website',
  ogSiteName: 'Thinkaction',
  ogDescription: 'Access your Thinkaction account to continue tracking your goals and ideas.',
});

const isEmailNotVerified = ref(false);

const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const form = ref({
  username: '',
  password: '',
});

const formErrors = ref<Record<string, string[]>>({
  username: [],
  password: [],
});

const isSubmitting = ref(false);
const onSignin = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await useAuth().signin(form.value.username, form.value.password);
    navigateTo('/');
  } catch (error: unknown) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.username = errors.username || [];
      formErrors.value.password = errors.password || [];

      if (errors.username?.[0] === 'Email associated with this account has not been verified') {
        isEmailNotVerified.value = true;
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};

const onResendEmail = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await useAuth().sendEmailVerification(form.value.username);
    toast('Please check your email to verify your account.', { color: 'success', timer: 10000 });
    navigateTo('/verify-email');
  } catch (error: unknown) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.username = errors.username || [];
      formErrors.value.password = errors.password || [];

      if (errors.username?.[0] === 'Email associated with this account has not been verified') {
        isEmailNotVerified.value = true;
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeRouteLeave((_to, _from, next) => {
  if (!isSubmitting.value) return next();
  const confirmed = window.confirm('A sign-in attempt is in progress. Are you sure you want to leave this page?');
  if (!confirmed) return next(false);
  next();
});
</script>

<template>
  <div class="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 z-10 overflow-hidden">
    <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply opacity-70 animate-float-one" />
    <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply opacity-70 animate-float-two" />

    <div class="text-center mb-8">
      <div class="flex justify-center">
        <logo />
      </div>
      <p class="text-gray-600 text-lg font-logo">
        Where every post brings you closer to your Goals!
      </p>
    </div>

    <form class="flex flex-col gap-2" @submit.prevent="onSignin">

      <base-input id="username" v-model="form.username" :disabled="isSubmitting" autofocus :errors="formErrors.username" type="text" placeholder="Username / Email" size="lg" rounded>
        <template #suffix>
          <span class="i-mdi:user-outline text-xl text-blue bg-blue" />
        </template>
      </base-input>

      <div v-if="isEmailNotVerified">
        <base-button :is-loading="isSubmitting" type="button" class="text-blue-500" @click="onResendEmail"><div class="i-line-md:email text-lg" />Resend Email Verification</base-button>
      </div>

      <base-input id="password" v-model="form.password" :disabled="isSubmitting" :errors="formErrors.password" :type="showPassword ? 'text' : 'password'" placeholder="Password" size="lg" rounded>
        <template #suffix>
          <button type="button" class="text-xl text-blue focus:outline-none" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="togglePassword">
            <span :class="showPassword ? 'i-mdi:eye-off-outline' : 'i-mdi:eye-outline'" />
          </button>
        </template>
      </base-input>

      <nuxt-link to="/forgot-password" class="block text-right text-sm text-purple-600 hover:text-purple-800 transition-colors">
        Forgot Password?
      </nuxt-link>

      <base-button type="submit" :is-loading="isSubmitting" size="xl" class="w-full cursor-pointer mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105">
        Sign In
      </base-button>
    </form>

    <div class="mt-8 text-center text-gray-700">
      Don't have an account?
      <nuxt-link to="/signup" class="text-blue-500 hover:text-blue-700 font-bold transition-colors">
        Sign Up!
      </nuxt-link>
    </div>
  </div>
</template>
