<script setup>
// RegisterPage — /register
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import IconHexagon from '@/assets/icons/IconHexagon.vue'
import IconUser from '@/assets/icons/IconUser.vue'
import IconMail from '@/assets/icons/IconMail.vue'
import IconPhone from '@/assets/icons/IconPhone.vue'
import IconCalendar from '@/assets/icons/IconCalendar.vue'
import IconLock from '@/assets/icons/IconLock.vue'
import IconEye from '@/assets/icons/IconEye.vue'
import IconEyeOff from '@/assets/icons/IconEyeOff.vue'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  password: '',
  confirmPassword: '',
})
const agreeTerms = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

// Shared Tailwind class strings
const labelClass = 'text-gray-700 text-xs font-bold uppercase leading-4 tracking-wider'

// Password strength
const passwordStrength = computed(() => {
  const pw = form.value.password
  if (!pw) return { level: 0, label: '', barClass: 'bg-stone-200', labelClass: 'text-gray-500' }

  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1)
    return { level: 1, label: 'Weak', barClass: 'bg-red-600', labelClass: 'text-red-600' }
  if (score === 2)
    return { level: 2, label: 'Fair', barClass: 'bg-amber-600', labelClass: 'text-amber-600' }
  if (score === 3)
    return {
      level: 3,
      label: 'Strong Security',
      barClass: 'bg-emerald-500',
      labelClass: 'text-emerald-800',
    }
  return {
    level: 4,
    label: 'Very Strong',
    barClass: 'bg-emerald-500',
    labelClass: 'text-emerald-800',
  }
})

const handleRegister = async () => {
  if (!agreeTerms.value) return
  isLoading.value = true
  try {
    await authStore.register(form.value)
    toast.success('Account created successfully!')
    router.push({
      name: authStore.isAdmin ? ROUTE_NAMES.ADMIN_DASHBOARD : ROUTE_NAMES.TRIP_VIEW,
    })
  } catch (err) {
    toast.error(err?.message || 'Registration failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-12 max-md:p-6"
  >
    <!-- Background -->
    <div class="absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-sky-500/85 to-violet-500">
      <div
        class="absolute -top-24 -left-32 h-96 w-lg rounded-full bg-sky-500/20 blur-[48px] max-md:hidden"
      ></div>
      <div
        class="absolute -right-16 -bottom-24 h-128 w-160 rounded-full bg-violet-500/20 blur-[48px] max-md:hidden"
      ></div>
      <div
        class="absolute bottom-0 left-0 h-48 w-full bg-white/5 [clip-path:ellipse(80%_100%_at_50%_100%)] max-md:hidden"
      ></div>
    </div>

    <!-- Main Card -->
    <div
      class="relative z-10 w-full max-w-130 overflow-hidden bg-white/70 shadow-lg backdrop-blur-xl max-md:max-w-full"
    >
      <div class="flex flex-col gap-8 p-12 pb-14 max-md:px-6 max-md:py-8">
        <!-- Header -->
        <header class="flex flex-col items-center gap-2">
          <div
            class="flex w-16 items-center justify-center rounded-full bg-white/40 py-3.5 text-sky-700/85"
          >
            <IconHexagon />
          </div>
          <h1 class="pt-2 text-center text-3xl leading-9 font-black text-zinc-900 max-md:text-2xl">
            Create Account
          </h1>
          <p class="text-center text-sm leading-5 text-gray-700">
            Join the next generation of bus travel
          </p>
        </header>

        <!-- Form -->
        <form class="flex flex-col gap-5" @submit.prevent="handleRegister">
          <!-- Full Name -->
          <div class="flex flex-col gap-2">
            <label :class="labelClass" for="reg-fullname">FULL NAME</label>
            <BaseInput
              id="reg-fullname"
              v-model="form.fullName"
              type="text"
              placeholder="Johnathan Doe"
              variant="none"
              required
              :ui="{ base: 'bg-stone-100/50 py-3.5 placeholder:text-slate-300' }"
            >
              <template #leading>
                <IconUser class="size-4 text-gray-500" />
              </template>
            </BaseInput>
          </div>

          <!-- Email + Phone Row -->
          <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div class="flex flex-col gap-2">
              <label :class="labelClass" for="reg-email">EMAIL</label>
              <BaseInput
                id="reg-email"
                v-model="form.email"
                type="email"
                placeholder="john@voyager.com"
                variant="none"
                required
                :ui="{ base: 'bg-stone-100/50 py-3.5 placeholder:text-slate-300' }"
              >
                <template #leading>
                  <IconMail class="size-4 text-gray-500" />
                </template>
              </BaseInput>
            </div>

            <div class="flex flex-col gap-2">
              <label :class="labelClass" for="reg-phone">PHONE</label>
              <BaseInput
                id="reg-phone"
                v-model="form.phone"
                type="tel"
                placeholder="901234567"
                variant="none"
                required
                :ui="{ base: 'bg-stone-100/50 py-3.5 placeholder:text-slate-300' }"
              >
                <template #leading>
                  <span class="flex items-center gap-1">
                    <IconPhone class="size-3.5 text-gray-500" />
                    <span class="text-xs leading-4 font-bold text-gray-700">+84</span>
                  </span>
                </template>
              </BaseInput>
            </div>
          </div>

          <!-- Date of Birth -->
          <div class="flex flex-col gap-2">
            <label :class="labelClass" for="reg-dob">DATE OF BIRTH</label>
            <BaseInput
              id="reg-dob"
              v-model="form.dateOfBirth"
              type="date"
              variant="none"
              required
              :ui="{ base: 'bg-stone-100/50 py-3 placeholder:text-slate-300' }"
            >
              <template #leading>
                <IconCalendar class="size-5 text-gray-500" />
              </template>
            </BaseInput>
          </div>

          <!-- Password + Confirm Row -->
          <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div class="flex flex-col gap-1">
              <label :class="labelClass" for="reg-password">PASSWORD</label>
              <BaseInput
                id="reg-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                variant="none"
                required
                :ui="{ base: 'bg-stone-100/50 py-3.5 placeholder:text-slate-300' }"
              >
                <template #leading>
                  <IconLock class="size-4 text-gray-500" />
                </template>
                <template #trailing>
                  <BaseButton
                    type="secondary"
                    size="sm"
                    aria-label="Toggle password visibility"
                    class="rounded-none! bg-transparent! p-0! text-gray-500 hover:text-zinc-900"
                    @click="showPassword = !showPassword"
                  >
                    <template #icon-left>
                      <IconEye v-if="!showPassword" class="size-5" />
                      <IconEyeOff v-else class="size-5" />
                    </template>
                  </BaseButton>
                </template>
              </BaseInput>
              <!-- Strength Meter -->
              <div v-if="form.password" class="flex flex-col gap-1 pt-1">
                <div class="flex gap-1">
                  <span
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded-full transition-all"
                    :class="
                      i <= passwordStrength.level ? passwordStrength.barClass : 'bg-stone-200'
                    "
                  ></span>
                </div>
                <span class="text-[10px] leading-4" :class="passwordStrength.labelClass">
                  {{ passwordStrength.label }}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label :class="labelClass" for="reg-confirm">CONFIRM</label>
              <BaseInput
                id="reg-confirm"
                v-model="form.confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="••••••••"
                variant="none"
                required
                :ui="{ base: 'bg-stone-100/50 py-3.5 placeholder:text-slate-300' }"
              >
                <template #leading>
                  <IconLock class="size-4 text-gray-500" />
                </template>
                <template #trailing>
                  <BaseButton
                    type="secondary"
                    size="sm"
                    aria-label="Toggle confirm password visibility"
                    class="rounded-none! bg-transparent! p-0! text-gray-500 hover:text-zinc-900"
                    @click="showConfirm = !showConfirm"
                  >
                    <template #icon-left>
                      <IconEye v-if="!showConfirm" class="size-5" />
                      <IconEyeOff v-else class="size-5" />
                    </template>
                  </BaseButton>
                </template>
              </BaseInput>
            </div>
          </div>

          <!-- Terms -->
          <label class="flex cursor-pointer items-center gap-3">
            <input
              v-model="agreeTerms"
              type="checkbox"
              class="h-5 w-5 shrink-0 cursor-pointer rounded-2xl bg-stone-200 accent-sky-500"
            />
            <span class="text-sm leading-5 text-gray-700">
              I agree to the
              <a href="#" class="text-sky-700 hover:underline">Terms of Service</a>
              and
              <a href="#" class="text-sky-700 hover:underline">Privacy Policy</a>
            </span>
          </label>

          <!-- Submit -->
          <BaseButton
            type="primary"
            size="lg"
            html-type="submit"
            :loading="isLoading"
            :disabled="!agreeTerms"
            block
            class="rounded-full! bg-linear-to-r! from-sky-700! to-violet-500! py-4! font-bold! text-white! shadow-[0px_8px_10px_-6px_rgba(0,101,145,0.20),0px_20px_25px_-5px_rgba(0,101,145,0.20)]"
          >
            Create Account
          </BaseButton>

          <!-- Footer Link -->
          <p class="text-center text-sm leading-5 text-gray-700">
            Already have an account?
            <router-link
              :to="{ name: ROUTE_NAMES.LOGIN }"
              class="text-sm leading-5 font-bold text-violet-700 hover:underline"
            >
              Sign in
            </router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
