<script setup>
import { computed, reactive, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'
import { USER_MANAGEMENT_ASSIGNABLE_ROLES } from '@/constants/admin/userManagement'

// Limits mirror AdminCreateUserRequest / AdminUpdateUserRequest on the BE.
const EMAIL_MAX_LENGTH = 100
const PASSWORD_MIN_LENGTH = 6
const PASSWORD_MAX_LENGTH = 72
const NAME_MAX_LENGTH = 150
const PHONE_MAX_LENGTH = 20
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // UserResponse to edit; null opens the modal in create mode.
  user: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const toast = useToast()
const store = useUserStore()
const errors = reactive({})
const form = reactive({
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'CUSTOMER',
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Escape / overlay must not close the modal while a save is in flight.
    if (!value && store.saving) return
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

const isEdit = computed(() => !!props.user?.id)
const saving = computed(() => store.saving)
// An ADMIN/EMPLOYEE keeps their role (shown read-only) or is moved to one of the assignable roles.
const roleOptions = computed(() => {
  const current = props.user?.role
  const assignable = USER_MANAGEMENT_ASSIGNABLE_ROLES.map((option) => ({
    ...option,
    selectable: true,
  }))
  if (isEdit.value && current && !assignable.some((option) => option.value === current)) {
    return [
      {
        label: current.charAt(0) + current.slice(1).toLowerCase(),
        value: current,
        selectable: false,
      },
      ...assignable,
    ]
  }
  return assignable
})

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

function validateForm() {
  clearErrors()

  if (!isEdit.value) {
    const email = form.email.trim()
    if (!email) errors.email = 'Enter an email'
    else if (email.length > EMAIL_MAX_LENGTH)
      errors.email = `Email must be ${EMAIL_MAX_LENGTH} characters or less`
    else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email'

    const passwordLength = form.password.length
    if (!passwordLength) errors.password = 'Enter an initial password'
    else if (passwordLength < PASSWORD_MIN_LENGTH || passwordLength > PASSWORD_MAX_LENGTH)
      errors.password = `Use ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters`
  }

  const fullName = form.fullName.trim()
  if (!fullName) errors.fullName = 'Enter a full name'
  else if (fullName.length > NAME_MAX_LENGTH)
    errors.fullName = `Full name must be ${NAME_MAX_LENGTH} characters or less`

  if (form.phone.trim().length > PHONE_MAX_LENGTH)
    errors.phone = `Phone must be ${PHONE_MAX_LENGTH} characters or less`

  if (!roleOptions.value.some((option) => option.value === form.role)) errors.role = 'Select a role'

  return !Object.keys(errors).length
}

function fillForm() {
  form.email = props.user?.email ?? ''
  form.password = ''
  form.fullName = props.user?.fullName ?? ''
  form.phone = props.user?.phone ?? ''
  form.role = props.user?.role ?? 'CUSTOMER'
  clearErrors()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) fillForm()
  },
  { immediate: true }
)

function closeModal() {
  isOpen.value = false
}

async function submitUser() {
  if (!validateForm()) return

  const base = {
    fullName: form.fullName.trim(),
    phone: form.phone.trim() || null,
    role: form.role,
  }

  const { password } = form
  try {
    const saved = isEdit.value
      ? await store.updateUser(props.user.id, base)
      : await store.createUser({ ...base, email: form.email.trim(), password })
    toast.success(isEdit.value ? 'User updated successfully' : 'User created successfully')
    isOpen.value = false
    emit('saved', saved)
  } catch (err) {
    // 400: show the BE field errors next to their inputs. 409 (duplicate email, D5 rules): toast.
    Object.entries(err?.errors ?? {}).forEach(([field, message]) => {
      if (field in form) errors[field] = message
    })
    toast.error(err?.message || 'Unable to save user')
  }
}
</script>

<template>
  <BaseModal v-model="isOpen" size="lg">
    <form
      class="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[32px] bg-white/90 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.06)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-md"
      novalidate
      @submit.prevent="submitUser"
    >
      <header
        class="flex items-center justify-between gap-4 px-6 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6"
      >
        <div class="flex min-w-0 items-center gap-4">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-700"
          >
            <UIcon
              :name="isEdit ? 'i-heroicons-pencil-square' : 'i-heroicons-user-plus'"
              class="size-6"
            />
          </div>
          <div class="min-w-0">
            <h2 class="text-xl leading-6 font-bold text-zinc-900">
              {{ isEdit ? 'Edit User' : 'Create User' }}
            </h2>
            <p class="mt-1 truncate text-sm leading-5 text-gray-700">
              {{ isEdit ? form.email : 'Add a driver, collector, or customer account' }}
            </p>
          </div>
        </div>
        <BaseButton
          unstyled
          html-type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-stone-100"
          aria-label="Close user modal"
          @click="closeModal"
        >
          <UIcon name="i-heroicons-x-mark" class="size-5" />
        </BaseButton>
      </header>

      <div class="flex flex-col gap-6 overflow-y-auto px-6 pb-6 md:px-8">
        <template v-if="!isEdit">
          <BaseInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="name@example.com"
            :disabled="saving"
            :error="errors.email"
            :ui="{ base: 'bg-stone-100 px-4 py-3.5' }"
          />
          <BaseInput
            v-model="form.password"
            type="password"
            label="Initial password"
            placeholder="At least 6 characters"
            :disabled="saving"
            :error="errors.password"
            :ui="{ base: 'bg-stone-100 px-4 py-3.5' }"
          />
          <p class="-mt-4 text-xs text-gray-500">
            Share this password with the user yourself; the system does not email it.
          </p>
        </template>

        <BaseInput
          v-model="form.fullName"
          label="Full name"
          placeholder="Nguyen Van A"
          :disabled="saving"
          :error="errors.fullName"
          :ui="{ base: 'bg-stone-100 px-4 py-3.5' }"
        />
        <BaseInput
          v-model="form.phone"
          type="tel"
          label="Phone (optional)"
          placeholder="0901 234 567"
          :disabled="saving"
          :error="errors.phone"
          :ui="{ base: 'bg-stone-100 px-4 py-3.5' }"
        />

        <div class="flex flex-col gap-2">
          <span
            id="user-role-label"
            class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase"
          >
            Role
          </span>
          <div
            role="radiogroup"
            aria-labelledby="user-role-label"
            class="grid gap-1 bg-stone-200 p-1"
            :class="roleOptions.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'"
          >
            <BaseButton
              v-for="option in roleOptions"
              :key="option.value"
              unstyled
              html-type="button"
              role="radio"
              :aria-checked="form.role === option.value"
              :disabled="saving || !option.selectable"
              class="rounded-xl px-3 py-2.5 text-center text-sm leading-5 transition disabled:opacity-60"
              :class="
                form.role === option.value
                  ? 'bg-white font-bold text-sky-700 shadow-sm'
                  : 'font-medium text-gray-700 hover:text-zinc-900'
              "
              @click="form.role = option.value"
            >
              {{ option.label }}
            </BaseButton>
          </div>
          <span
            v-if="roleOptions.some((option) => !option.selectable)"
            class="text-xs text-gray-500"
          >
            This role cannot be assigned from here. Keep it, or move the user to another role.
          </span>
          <span v-if="errors.role" class="text-xs text-red-500">{{ errors.role }}</span>
        </div>
      </div>

      <footer
        class="flex flex-col-reverse gap-3 px-6 pt-4 pb-6 sm:flex-row sm:justify-end md:px-8 md:pb-8"
      >
        <BaseButton type="secondary" html-type="button" :disabled="saving" @click="closeModal">
          Cancel
        </BaseButton>
        <BaseButton html-type="submit" :loading="saving">
          <template #icon-left>
            <UIcon :name="isEdit ? 'i-heroicons-check' : 'i-heroicons-plus'" class="size-4" />
          </template>
          {{ isEdit ? 'Save Changes' : 'Create User' }}
        </BaseButton>
      </footer>
    </form>
  </BaseModal>
</template>
