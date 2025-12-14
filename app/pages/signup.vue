<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

useHead({
  link: [
    { rel: 'canonical', href: 'https://thinkaction.id/signup' },
  ],
});

useSeoMeta({
  title: 'Create Account | Thinkaction',
  description: 'Sign up to create your free account and start tracking your goals and content.',
  ogTitle: 'Create Account | Thinkaction',
  ogType: 'website',
  ogSiteName: 'Thinkaction',
  ogDescription: 'Sign up to create your free account and start tracking your goals and content.',
});

const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const form = ref();

const formReset = () => {
  form.value = {
    email: '',
    password: '',
    username: '',
    name: '',
    // email: 'admin@example.com',
    // password: '12341234',
    // username: 'admin',
    // name: 'admin',
  };
};

formReset();

const formErrors = ref<Record<string, string[]>>({
  email: [],
  password: [],
  username: [],
  name: [],
});

const generateRandomName = async () => {
  const random = await randomName();
  form.value.username = random.username;
  form.value.name = random.fullname;
};

const isSubmitting = ref(false);
const onSignup = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await useAuth().signup(form.value);
    toast(`Account created! Please check your email ${form.value.email} to verify your account.`, { color: 'success', timer: 10000 });
    formReset();
    navigateTo('/signin');
  } catch (error) {
    const errors = handleError(error);
    if (errors) {
      formErrors.value.email = errors.email || [];
      formErrors.value.username = errors.username || [];
      formErrors.value.name = errors.name || [];
      formErrors.value.password = errors.password || [];
    }
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeRouteLeave((_to, _from, next) => {
  if (!isSubmitting.value) return next();
  const confirmed = window.confirm('A signup is in progress. Leaving now may interrupt the process. Do you want to continue?');
  if (!confirmed) return next(false);
  next();
});

watch(() => form.value.username, (newValue) => {
  if (typeof newValue === 'string') {
    const lowerCaseValue = newValue.toLocaleLowerCase();

    if (form.value.username !== lowerCaseValue) {
      form.value.username = lowerCaseValue;
    }
  }
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

    <form class="flex flex-col gap-2" @submit.prevent="onSignup">
      <base-input id="email" v-model="form.email" autofocus :errors="formErrors.email" type="text" placeholder="Email" size="lg" rounded>
        <template #suffix>
          <span class="i-mdi:email-outline text-xl text-blue bg-blue" />
        </template>
      </base-input>
      <base-input id="password" v-model="form.password" :errors="formErrors.password" :type="showPassword ? 'text' : 'password'" placeholder="Password" size="lg" rounded>
        <template #suffix>
          <button type="button" class="text-xl text-blue focus:outline-none" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="togglePassword">
            <span :class="showPassword ? 'i-mdi:eye-off-outline' : 'i-mdi:eye-outline'" />
          </button>
        </template>
      </base-input>
      <base-input id="username" v-model="form.username" :errors="formErrors.username" type="text" placeholder="Username" size="lg" rounded>
        <template #suffix>
          <span class="i-mdi:user-outline text-xl text-blue bg-blue" />
        </template>
      </base-input>
      <base-input id="name" v-model="form.name" :errors="formErrors.name" type="text" placeholder="Full Name" size="lg" rounded>
        <template #suffix>
          <span class="i-mdi:user-outline text-xl text-blue bg-blue" />
        </template>
      </base-input>
      <div class="text-xs text-slate-500 px-2">
        Use your real name if you want people to identify you and credit your content. Otherwise generate
        <button type="button" class="text-blue-700 cursor-pointer py-0.5 px-1.5 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors" @click="generateRandomName">
          <span class="i-oui:generate -mt-0.5" /> Random
        </button>
        name.
      </div>

      <base-button size="xl" :is-loading="isSubmitting" type="submit" class="w-full cursor-pointer mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105">
        Sign Up
      </base-button>
    </form>

    <div class="mt-8 text-center text-gray-700">
      Already have an account?
      <nuxt-link to="/signin" class="text-blue-500 hover:text-blue-700 font-bold transition-colors">
        Sign In
      </nuxt-link>
    </div>
  </div>
</template>
