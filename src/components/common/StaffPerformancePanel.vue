<script setup>
defineProps({
  staff: { type: Array, default: () => [] },
})

function roleClass(tone) {
  return tone === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-sky-100 text-sky-600'
}

function barClass(tone) {
  return tone === 'purple' ? 'bg-purple-500' : 'bg-sky-500'
}
</script>

<template>
  <section class="rounded-2xl bg-white p-6 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.04)]">
    <h2 class="text-base leading-6 font-normal text-zinc-900">Staff Performance</h2>

    <div class="mt-6 flex flex-col gap-6">
      <article v-for="member in staff" :key="member.id" class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-purple-200 text-xs font-bold text-sky-900"
            >
              {{ member.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs leading-4 font-bold text-zinc-900">{{ member.name }}</p>
              <span
                class="inline-flex rounded-2xl px-1.5 py-px text-[8px] leading-3 font-black uppercase"
                :class="roleClass(member.tone)"
              >
                {{ member.role }}
              </span>
            </div>
          </div>
          <p class="text-xs leading-4 font-bold text-emerald-800">{{ member.score }}%</p>
        </div>

        <div class="h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            class="h-1.5 rounded-full"
            :class="barClass(member.tone)"
            :style="{ width: `${Math.min(100, Math.max(0, Number(member.score) || 0))}%` }"
          ></div>
        </div>
      </article>
    </div>
  </section>
</template>
