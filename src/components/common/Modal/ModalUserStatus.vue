<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

/**
 * ModalUserStatus — confirm locking or unlocking one account (spec review 1.2 S16).
 * A locked user cannot log in and their current token stops working at once (D3 = A).
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // UserResponse whose `active` flag will be flipped.
  user: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const toast = useToast()
const store = useUserStore()

const pending = computed(() => !!props.user && store.statusUpdatingId === props.user.id)
const locking = computed(() => props.user?.active !== false)
const displayName = computed(() => props.user?.fullName || props.user?.email || 'this user')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Escape / overlay must not close the modal while the request is in flight.
    if (!value && pending.value) return
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

function closeModal() {
  isOpen.value = false
}

async function confirm() {
  if (!props.user || pending.value) return
  try {
    const saved = await store.setUserActive(props.user.id, !locking.value)
    toast.success(locking.value ? 'User locked' : 'User unlocked')
    isOpen.value = false
    emit('saved', saved)
  } catch (err) {
    // 409: self, last active admin, or a driver with an unfinished trip (D5).
    toast.error(err?.message || 'Unable to change user status')
  }
}
</script>

<template>
  <BaseModal v-model="isOpen" size="sm">
    <div class="flex flex-col gap-6 rounded-[32px] bg-white p-6 md:p-8">
      <div class="flex items-start gap-4">
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-full"
          :class="locking ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'"
        >
          <UIcon
            :name="locking ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
            class="size-6"
          />
        </div>
        <div class="min-w-0">
          <h2 class="text-xl leading-6 font-bold text-zinc-900">
            {{ locking ? 'Lock account?' : 'Unlock account?' }}
          </h2>
          <p class="mt-2 text-sm leading-5 break-words text-gray-700">
            <template v-if="locking">
              <strong>{{ displayName }}</strong> will be signed out and will not be able to log in
              until you unlock the account.
            </template>
            <template v-else>
              <strong>{{ displayName }}</strong> will be able to log in again.
            </template>
          </p>
        </div>
      </div>
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <BaseButton type="secondary" html-type="button" :disabled="pending" @click="closeModal">
          Cancel
        </BaseButton>
        <BaseButton
          v-if="locking"
          unstyled
          html-type="button"
          :loading="pending"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="confirm"
        >
          <UIcon name="i-heroicons-lock-closed" class="size-4" />
          Lock account
        </BaseButton>
        <BaseButton v-else html-type="button" :loading="pending" @click="confirm">
          Unlock account
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
