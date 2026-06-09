<script setup>
// UserManagement — /admin/users
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BasePagination from '@/components/elements/BasePagination.vue'
import { useUserStore } from '@/stores/user'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import {
  USER_MANAGEMENT_COLUMNS,
  USER_MANAGEMENT_FALLBACK_USERS,
  USER_MANAGEMENT_ROLE_BADGE_CLASSES,
  USER_MANAGEMENT_ROLE_TABS,
} from '@/constants/admin/userManagement'

const userStore = useUserStore()
const { users, loading, error, total } = storeToRefs(userStore)
const pagination = usePagination()
const toast = useToast()

const selectedRole = ref('all')
const warning = ref('')
const deletingId = ref(null)

const normalizedUsers = computed(() => users.value.map(normalizeUser))
const fallbackUsers = computed(() => USER_MANAGEMENT_FALLBACK_USERS.map(normalizeUser))
const isFallbackMode = computed(() => !normalizedUsers.value.length && !!warning.value)
const visibleUsers = computed(() =>
  isFallbackMode.value ? fallbackUsers.value : normalizedUsers.value
)

const tabCounts = computed(() => {
  const records = normalizedUsers.value.length ? normalizedUsers.value : fallbackUsers.value

  return USER_MANAGEMENT_ROLE_TABS.reduce((counts, tab) => {
    counts[tab.value] =
      tab.value === 'all'
        ? total.value || records.length
        : records.filter((user) => user.role === tab.value).length
    return counts
  }, {})
})

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function normalizeRole(value) {
  const role = String(value || 'user').toLowerCase()

  if (role.includes('admin')) return 'admin'
  if (role.includes('driver')) return 'driver'
  if (role.includes('collector')) return 'collector'
  if (role.includes('customer')) return 'customer'
  return 'user'
}

function normalizeActive(user) {
  const active = firstDefined(user.active, user.enabled)
  if (typeof active === 'boolean') return active

  if (user.status) {
    const status = String(user.status).toLowerCase()
    if (['inactive', 'disabled', 'blocked', 'suspended'].includes(status)) return false
    if (status === 'active') return true
  }

  return true
}

function getInitials(name) {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function normalizeUser(user, index = 0) {
  const name = firstDefined(user.name, user.fullName, user.username, 'Unknown user')

  return {
    id: firstDefined(user.id, user._id, user.userId, `user-${index}`),
    name,
    email: firstDefined(user.email, 'No email'),
    role: normalizeRole(user.role ?? user.authority ?? user.scope),
    active: normalizeActive(user),
    lastActivity: firstDefined(
      user.lastActivity,
      user.lastLoginAt,
      user.updatedAt,
      'No recent activity'
    ),
    avatar: firstDefined(user.avatar, user.avatarUrl, ''),
    initials: getInitials(name) || 'U',
  }
}

function roleBadgeClass(role) {
  return USER_MANAGEMENT_ROLE_BADGE_CLASSES[role] ?? USER_MANAGEMENT_ROLE_BADGE_CLASSES.user
}

function buildFetchParams() {
  const params = {
    page: pagination.page.value,
    size: pagination.size.value,
  }

  if (selectedRole.value !== 'all') params.role = selectedRole.value
  return params
}

async function fetchUsers() {
  warning.value = ''

  try {
    await userStore.fetchAll(buildFetchParams())
    pagination.total.value = total.value

    if (!users.value.length) {
      warning.value = 'No users were returned by the API. Showing sample user management data.'
    }
  } catch (err) {
    pagination.total.value = 0
    warning.value = err?.message || 'Unable to load users. Showing sample user management data.'
  }
}

async function selectRole(role) {
  if (role === selectedRole.value || loading.value) return
  selectedRole.value = role
  pagination.reset()
  await fetchUsers()
}

async function goToNextPage() {
  pagination.nextPage()
  await fetchUsers()
}

async function goToPrevPage() {
  pagination.prevPage()
  await fetchUsers()
}

async function deleteUser(user) {
  if (isFallbackMode.value || deletingId.value || loading.value) return

  const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`)
  if (!confirmed) return

  deletingId.value = user.id

  try {
    await userStore.deleteUser(user.id)
    toast.success('User deleted successfully')
    await fetchUsers()
  } catch (err) {
    toast.error(err?.message || 'Unable to delete user')
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="flex flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-10">
    <header class="flex flex-col gap-2">
      <h1 class="text-3xl leading-9 font-bold text-zinc-900">User Management</h1>
      <p class="max-w-xl text-base leading-6 text-gray-700">
        Oversee and manage travelers, operators, and staff from one admin workspace.
      </p>
    </header>

    <section class="overflow-x-auto">
      <div
        class="inline-flex min-w-max items-center justify-start gap-2 rounded-full bg-stone-200 p-1.5 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]"
        role="tablist"
        aria-label="User role filters"
      >
        <BaseButton
          v-for="tab in USER_MANAGEMENT_ROLE_TABS"
          :key="tab.value"
          unstyled
          html-type="button"
          role="tab"
          :aria-selected="selectedRole === tab.value"
          :disabled="loading"
          class="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm leading-5 transition-colors"
          :class="
            selectedRole === tab.value
              ? 'bg-white font-bold text-sky-700 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
              : 'font-medium text-gray-700 hover:text-zinc-900'
          "
          @click="selectRole(tab.value)"
        >
          <span>{{ tab.label }}</span>
          <span
            class="rounded-md px-2 py-0.5 text-[10px] leading-5"
            :class="
              selectedRole === tab.value
                ? 'bg-sky-700/10 text-sky-700'
                : 'bg-stone-300 text-gray-700'
            "
          >
            {{ tabCounts[tab.value] ?? 0 }}
          </span>
        </BaseButton>
      </div>
    </section>

    <BaseEmptyState v-if="warning" :title="warning" tone="warning" class="text-left" />
    <BaseEmptyState v-else-if="error" :title="error" tone="danger" class="text-left" />

    <section
      class="overflow-hidden rounded-3xl bg-white/80 shadow-[0px_32px_64px_0px_rgba(27,27,28,0.04)] outline outline-1 outline-offset-[-1px] outline-white/50 backdrop-blur-md"
    >
      <div v-if="loading && !deletingId" class="p-8 text-center text-sm font-semibold text-sky-700">
        Loading users...
      </div>

      <div v-else-if="!visibleUsers.length" class="p-8">
        <BaseEmptyState
          title="No users found"
          description="Try another role filter or refresh after users are created."
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[880px] divide-y divide-zinc-100">
          <thead class="bg-stone-100/70">
            <tr>
              <th
                v-for="column in USER_MANAGEMENT_COLUMNS"
                :key="column.key"
                class="px-6 py-4 text-left text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase"
                :class="{ 'text-right': column.key === 'action' }"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 bg-white">
            <tr
              v-for="user in visibleUsers"
              :key="user.id"
              class="transition-colors hover:bg-sky-50/50"
            >
              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="relative size-12 shrink-0">
                    <img
                      v-if="user.avatar"
                      :src="user.avatar"
                      :alt="`${user.name} avatar`"
                      class="size-12 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                    <div
                      v-else
                      class="flex size-12 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-sm font-bold text-sky-800 shadow-sm"
                    >
                      {{ user.initials }}
                    </div>
                    <span
                      class="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white"
                      :class="user.active ? 'bg-emerald-500' : 'bg-zinc-300'"
                    ></span>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-base leading-6 font-bold text-zinc-900">
                      {{ user.name }}
                    </p>
                    <p class="truncate text-xs leading-4 font-medium text-gray-700">
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-5">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ring-1"
                  :class="roleBadgeClass(user.role)"
                >
                  {{ user.role.toUpperCase() }}
                </span>
              </td>

              <td class="px-6 py-5">
                <span
                  class="inline-flex w-10 items-center rounded-full p-0.5"
                  :class="
                    user.active ? 'justify-end bg-blue-500/20' : 'justify-start bg-slate-300/30'
                  "
                  :aria-label="user.active ? 'Active user' : 'Inactive user'"
                >
                  <span
                    class="size-4 rounded-full shadow-sm"
                    :class="user.active ? 'bg-blue-500' : 'bg-zinc-300'"
                  ></span>
                </span>
              </td>

              <td class="px-6 py-5">
                <p class="text-sm leading-5 text-zinc-900">{{ user.lastActivity }}</p>
              </td>

              <td class="px-6 py-5 text-right">
                <BaseButton
                  unstyled
                  html-type="button"
                  class="inline-flex size-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-40"
                  :loading="deletingId === user.id"
                  :disabled="isFallbackMode || loading"
                  :aria-label="`Delete ${user.name}`"
                  @click="deleteUser(user)"
                >
                  <UIcon name="i-heroicons-trash" class="size-4" />
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        :page="pagination.page.value"
        :total-pages="pagination.totalPages.value"
        :has-prev-page="pagination.hasPrevPage.value"
        :has-next-page="pagination.hasNextPage.value"
        :loading="loading"
        @prev="goToPrevPage"
        @next="goToNextPage"
      />
    </section>
  </div>
</template>
