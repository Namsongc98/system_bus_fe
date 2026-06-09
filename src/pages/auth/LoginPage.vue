<script setup>
// LoginPage — /login
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import IconHexagon from '@/assets/icons/IconHexagon.vue'
import IconMail from '@/assets/icons/IconMail.vue'
import IconLock from '@/assets/icons/IconLock.vue'
import IconEye from '@/assets/icons/IconEye.vue'
import IconEyeOff from '@/assets/icons/IconEyeOff.vue'
import IconArrow from '@/assets/icons/IconArrow.vue'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = ref({
  email: '',
  password: '',
})
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

const labelClass = 'pl-1 text-gray-700 text-xs font-bold uppercase tracking-wider'

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  isLoading.value = true
  try {
    await authStore.login(form.value)
    toast.success('Welcome back!')
    router.push({
      name: authStore.isAdmin ? ROUTE_NAMES.ADMIN_DASHBOARD : ROUTE_NAMES.TRIP_VIEW,
    })
  } catch (err) {
    console.log(err)
    toast.error(err?.message || 'Login failed. Please check your credentials.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="relative flex h-screen items-start justify-center overflow-y-auto px-6 py-4">
    <!-- Background -->
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-sky-500 via-violet-500 to-violet-700">
      <div
        class="absolute top-[102px] left-[64px] h-64 w-64 rounded-full bg-sky-700 opacity-30 mix-blend-overlay blur-[32px] max-md:hidden"
      ></div>
      <div
        class="absolute top-[538px] left-[832px] h-96 w-96 rounded-full bg-emerald-400 opacity-20 mix-blend-overlay blur-[32px] max-md:hidden"
      ></div>

      <!-- Decor -->
      <div class="pointer-events-none absolute inset-0 opacity-10 max-md:hidden">
        <div
          class="absolute top-[60px] left-[240px] h-32 w-32 rotate-45 rounded-[48px] border-4 border-white"
        ></div>
        <div
          class="absolute right-[200px] bottom-[80px] h-48 w-48 rounded-full border-2 border-white"
        ></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex w-full max-w-[384px] flex-col items-center gap-6">
      <!-- Logo -->
      <header class="flex flex-col items-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-[0px_25px_50px_-12px_rgba(0,101,145,0.40)] backdrop-blur-[6px]"
        >
          <IconHexagon class="text-white" />
        </div>
        <div class="pt-4">
          <h1 class="text-center text-2xl leading-8 font-black text-white">Fluid Voyager Admin</h1>
        </div>
      </header>

      <!-- Glass Card -->
      <div
        class="flex w-full flex-col gap-6 bg-white/70 p-8 shadow-2xl outline outline-1 outline-offset-[-1px] outline-white/30 backdrop-blur-[6px] max-md:p-6"
      >
        <!-- Header -->
        <div class="flex flex-col items-center gap-2">
          <h2 class="text-center text-3xl leading-9 font-extrabold text-zinc-900">Welcome Back</h2>
          <p class="text-center text-base leading-6 font-medium text-gray-700">
            Sign in to continue
          </p>
        </div>

        <!-- Form -->
        <form class="flex flex-col gap-6" @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="flex flex-col gap-2">
            <label :class="labelClass" for="login-email">EMAIL ADDRESS</label>
            <BaseInput
              id="login-email"
              v-model="form.email"
              type="email"
              placeholder="admin@fluidvoyager.com"
              variant="none"
              required
              :ui="{ base: 'bg-stone-100 py-4 placeholder:text-gray-500/60' }"
            >
              <template #leading>
                <IconMail class="size-4 text-gray-700" />
              </template>
            </BaseInput>
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-2">
            <label :class="labelClass" for="login-password">PASSWORD</label>
            <BaseInput
              id="login-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              variant="none"
              required
              :ui="{ base: 'bg-stone-100 py-4 placeholder:text-gray-500/60' }"
            >
              <template #leading>
                <IconLock class="size-4 text-gray-700" />
              </template>
              <template #trailing>
                <BaseButton
                  type="secondary"
                  size="sm"
                  aria-label="Toggle password visibility"
                  class="!rounded-none !bg-transparent !p-0 text-gray-700 hover:text-zinc-900"
                  @click="togglePassword"
                >
                  <template #icon-left>
                    <IconEye v-if="!showPassword" class="size-5" />
                    <IconEyeOff v-else class="size-5" />
                  </template>
                </BaseButton>
              </template>
            </BaseInput>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between">
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="h-5 w-5 cursor-pointer rounded-md border border-slate-300 bg-stone-200 accent-sky-600"
              />
              <span class="text-sm leading-5 font-medium text-gray-700">Remember me</span>
            </label>
            <router-link
              class="text-sm font-bold text-sky-700 transition-all hover:underline"
              to="/forgot-password"
            >
              Forgot password?
            </router-link>
          </div>

          <!-- Submit -->
          <BaseButton
            html-type="submit"
            :loading="isLoading"
            block
            class="rounded-full bg-gradient-to-r from-sky-700 to-violet-500 py-4 text-lg font-bold shadow-[0px_10px_15px_-3px_rgba(0,101,145,0.20),0px_4px_6px_-4px_rgba(0,101,145,0.20)]"
          >
            Login
            <template #icon-right>
              <IconArrow class="size-4" />
            </template>
          </BaseButton>
        </form>

        <!-- Divider -->
        <div class="relative flex items-center justify-center">
          <div class="absolute inset-x-0 top-1/2 h-px border-t border-slate-300/30"></div>
          <div class="relative rounded-full bg-white/10 px-4 py-1 backdrop-blur-[2px]">
            <span class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase"
              >OR</span
            >
          </div>
        </div>

        <!-- Social -->
        <div class="flex w-full gap-4">
          <div class="flex items-center">
            <BaseButton
              type="secondary"
              class="!rounded-none !bg-stone-100 !px-11 !py-4 text-sm font-bold text-zinc-900 hover:!bg-stone-200"
            >
              <template #icon-left>
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  class="h-5 w-5"
                />
              </template>
              Google
            </BaseButton>
          </div>
          <div class="flex items-center">
            <BaseButton
              type="secondary"
              class="!rounded-none !bg-stone-100 !px-11 !py-4 text-sm font-bold text-zinc-900 hover:!bg-stone-200"
            >
              <template #icon-left>
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="Facebook"
                  class="h-5 w-5"
                />
              </template>
              Facebook
            </BaseButton>
          </div>
        </div>

        <!-- Sign up -->
        <p class="pt-2 text-center text-base leading-6">
          <span class="font-medium text-gray-700">Don't have an account? </span>
          <router-link class="font-medium text-sky-700 hover:underline" to="/register"
            >Sign up</router-link
          >
        </p>
      </div>

      <!-- Footer -->
      <footer class="flex flex-col items-center gap-4 pt-4">
        <p class="text-xs leading-4 font-bold tracking-wider text-white/60 uppercase">
          FLUID VOYAGER ADMIN • V1.0.0
        </p>
        <div class="flex gap-6">
          <a
            href="#"
            class="text-xs leading-4 font-medium text-white/40 transition-all hover:text-white/70"
            >Privacy Policy</a
          >
          <a
            href="#"
            class="text-xs leading-4 font-medium text-white/40 transition-all hover:text-white/70"
            >Terms of Service</a
          >
        </div>
      </footer>
    </div>
  </div>
</template>
