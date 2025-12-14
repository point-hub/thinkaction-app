<script setup lang="ts">
definePageMeta({
  layout: 'marketing',
});
</script>

<template>
  <section class="bg-slate-100 max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-8 text-center rounded-xl shadow-xl mt-4">
    <h2 class="text-xl lg:text-3xl font-bold mb-6 text-[#028F61]">
      Plan Smart. Act Together.
    </h2>
    <p class="text-slate-700 text-lg leading-relaxed">
      <strong>Thinkaction</strong> isn’t just another social media — it’s your growth hub.
      Plan your <strong>SMART goals</strong> (Specific, Measurable, Achievable, Relevant, Time-bound)
      and achieve them with support from your friends and communities worldwide.
    </p>
    <div class="flex justify-center gap-4 py-6">
      <nuxt-link
        to="/signup"
        class="px-5 py-2 lg:px-8 lg:py-3 bg-[#6BBB95] text-white rounded-full text-base font-semibold hover:opacity-90 transition"
      >
        Join Now
      </nuxt-link>
      <nuxt-link
        to="/"
        class="px-5 py-2 lg:px-8 lg:py-3 border border-[#6BBB95] text-[#6BBB95] bg-white rounded-full text-base font-semibold hover:bg-[#6BBB95]/10 transition"
      >
        Explore Goals
      </nuxt-link>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-left">
      <div
        class="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 border-t-4 border-[#FAAF61]"
      >
        <div class="i-lucide:target text-4xl text-[#FAAF61] mb-3" />
        <h3 class="font-semibold mb-2">
          Set SMART Goals
        </h3>
        <p class="text-sm text-slate-600">
          Define your goals clearly and make them achievable with guided templates.
        </p>
      </div>
      <div
        class="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 border-t-4 border-[#6BBB95]"
      >
        <div class="i-lucide:users text-4xl text-[#6BBB95] mb-3" />
        <h3 class="font-semibold mb-2">
          Join Communities
        </h3>
        <p class="text-sm text-slate-600">
          Connect with people who share your passion and support each other daily.
        </p>
      </div>
      <div
        class="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 border-t-4 border-[#92A8D1]"
      >
        <div class="i-lucide:rocket text-4xl text-[#92A8D1] mb-3" />
        <h3 class="font-semibold mb-2">
          Track Progress
        </h3>
        <p class="text-sm text-slate-600">
          Celebrate milestones and stay motivated as your community cheers you on.
        </p>
      </div>
    </div>
  </section>
</template>
