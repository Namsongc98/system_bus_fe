<script setup>
// AppFooter — user layout shell footer
// Classification: components/layout/ — no store, no service, no API calls
import BaseButton from '@/components/elements/BaseButton.vue'

import { ref } from 'vue'
import { USER_FOOTER_QUICK_LINKS, USER_FOOTER_SOCIAL_LINKS } from '@/constants/user/layout'
import { ROUTE_NAMES } from '@/constants/routes'

const currentYear = new Date().getFullYear()
const newsletterEmail = ref('')
</script>

<template>
  <footer class="w-full border-t border-slate-300/10 bg-slate-50">
    <div class="mx-auto w-full max-w-[1280px] px-8 py-16">
      <!-- Grid: 3 columns on md+, stacked on mobile -->
      <div class="grid grid-cols-1 gap-12 border-b border-slate-200/60 pb-10 md:grid-cols-3">
        <!-- Col 1 — Brand -->
        <div class="flex flex-col gap-4">
          <router-link
            :to="{ name: ROUTE_NAMES.TRIP_VIEW }"
            class="font-['Inter'] text-xl leading-7 font-normal text-slate-900 transition-colors hover:text-sky-700"
          >
            Fluid Voyager
          </router-link>
          <p class="max-w-xs font-['Inter'] text-sm leading-5 font-normal text-slate-500">
            Elevating your travel experience with seamless digital booking and premium road
            journeys.
          </p>
          <!-- Social links -->
          <div class="mt-2 flex items-center gap-3">
            <a
              v-for="social in USER_FOOTER_SOCIAL_LINKS"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-sky-300 hover:text-sky-700"
            >
              <UIcon :name="social.icon" class="h-4 w-4" />
            </a>
          </div>
        </div>

        <!-- Col 2 — Quick Links -->
        <div class="flex flex-col gap-4">
          <h4
            class="font-['Inter'] text-sm leading-5 font-normal tracking-wide text-sky-700 uppercase"
          >
            Quick Links
          </h4>
          <nav aria-label="Footer navigation">
            <ul class="flex flex-col gap-2">
              <li v-for="link in USER_FOOTER_QUICK_LINKS" :key="link.name" class="opacity-80">
                <router-link
                  :to="{ name: link.name }"
                  class="font-['Inter'] text-sm leading-5 font-normal text-slate-500 transition-colors hover:text-sky-700"
                >
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Col 3 — Newsletter -->
        <div class="flex flex-col gap-4">
          <h4
            class="font-['Inter'] text-sm leading-5 font-normal tracking-wide text-sky-700 uppercase"
          >
            Newsletter
          </h4>
          <div class="flex items-center gap-2">
            <BaseInput
              v-model="newsletterEmail"
              type="email"
              placeholder="Enter email"
              class="flex-1 rounded-full border border-slate-300/30 bg-white px-4 py-2.5 font-['Inter'] text-sm font-normal text-gray-500 transition-all outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
            />
            <BaseButton
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-700 text-white transition-colors hover:bg-sky-800"
              aria-label="Subscribe to newsletter"
            >
              <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="flex flex-col items-center justify-between gap-2 pt-6 md:flex-row">
        <p class="font-['Inter'] text-[10px] leading-4 font-normal text-slate-400">
          © {{ currentYear }} Fluid Voyager. Seamless Journeys.
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-[10px] text-slate-400 transition-colors hover:text-slate-600"
            >Privacy Policy</a
          >
          <a href="#" class="text-[10px] text-slate-400 transition-colors hover:text-slate-600"
            >Terms of Service</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
