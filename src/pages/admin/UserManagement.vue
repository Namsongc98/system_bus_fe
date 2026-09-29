<script setup>
// UserManagement — /admin/users
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BasePagination from '@/components/elements/BasePagination.vue'
import ModalUserForm from '@/components/common/Modal/ModalUserForm.vue'
import ModalUserStatus from '@/components/common/Modal/ModalUserStatus.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import {
  USER_MANAGEMENT_COLUMNS,
  USER_MANAGEMENT_EMPTY_TITLES,
  USER_MANAGEMENT_ROLE_BADGE_CLASSES,
  USER_MANAGEMENT_ROLE_TABS,
} from '@/constants/admin/userManagement'

const userStore = useUserStore()
const authStore = useAuthStore()
const { users, page, loading, error, counts, countsError, statusUpdatingId } =
  storeToRefs(userStore)

const selectedRole = ref('all')
const formOpen = ref(false)
const editingUser = ref(null)
const statusOpen = ref(false)
const statusUser = ref(null)

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const rows = computed(() => users.value.map(toRow))
// The loading / error block replaces the table only when there is nothing to show yet.
const showLoading = computed(() => loading.value && !rows.value.length)
const showEmpty = computed(() => !loading.value && !error.value && !rows.value.length)
const emptyTitle = computed(
  () => USER_MANAGEMENT_EMPTY_TITLES[selectedRole.value] ?? USER_MANAGEMENT_EMPTY_TITLES.all
)

function tabCount(tab) {
  if (countsError.value) return null
  return tab.value === 'all' ? counts.value.total : (counts.value.byRole[tab.value] ?? 0)
}

function getInitials(name) {
  return String(name)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

// UserResponse → table row. Name falls back to the email: users from public register have no profile.
function toRow(user) {
  const name = user.fullName || user.email
  return {
    ...user,
    name,
    initials: getInitials(name) || 'U',
    createdLabel: formatDate(user.createdAt),
    isSelf: authStore.user?.id != null && String(authStore.user.id) === String(user.id),
  }
}

function roleBadgeClass(role) {
  return USER_MANAGEMENT_ROLE_BADGE_CLASSES[role] ?? USER_MANAGEMENT_ROLE_BADGE_CLASSES.EMPLOYEE
}

function loadUsers(pageNumber) {
  return userStore.fetchAll({
    page: pageNumber,
    role: selectedRole.value === 'all' ? null : selectedRole.value,
  })
}

async function selectRole(role) {
  if (role === selectedRole.value) return
  selectedRole.value = role
  await loadUsers(0)
}

function openCreate() {
  editingUser.value = null
  formOpen.value = true
}

function openEdit(user) {
  editingUser.value = user
  formOpen.value = true
}

function openStatus(user) {
  if (user.isSelf) return
  statusUser.value = user
  statusOpen.value = true
}

onMounted(() => Promise.all([loadUsers(0), userStore.fetchCounts()]))
</script>

<template>
  <div class="flex flex-col gap-8 px-4 pt-6 pb-24 md:px-8 md:pt-10">
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
            v-if="tabCount(tab) !== null"
            class="rounded-md px-2 py-0.5 text-[10px] leading-5"
            :class="
              selectedRole === tab.value
                ? 'bg-sky-700/10 text-sky-700'
                : 'bg-stone-300 text-gray-700'
            "
          >
            {{ tabCount(tab) }}
          </span>
        </BaseButton>
      </div>
    </section>

    <div v-if="error" role="alert" class="flex flex-col gap-3" data-testid="users-error">
      <BaseEmptyState :title="error" tone="danger" class="text-left" />
      <BaseButton
        label="Retry"
        type="outline"
        size="sm"
        class="self-center"
        @click="loadUsers(page.page)"
      />
    </div>

    <section
      class="overflow-hidden rounded-3xl bg-white/80 shadow-[0px_32px_64px_0px_rgba(27,27,28,0.04)] outline outline-1 outline-offset-[-1px] outline-white/50 backdrop-blur-md"
    >
      <div
        v-if="showLoading"
        role="status"
        class="p-8 text-center text-sm font-semibold text-sky-700"
        data-testid="users-loading"
      >
        Loading users...
      </div>

      <div v-else-if="showEmpty" class="p-8" data-testid="users-empty">
        <BaseEmptyState
          :title="emptyTitle"
          description="Create a user with the + button, or pick another role."
        />
      </div>

      <div v-else-if="rows.length" class="overflow-x-auto" :aria-busy="loading">
        <table class="w-full min-w-[880px] divide-y divide-zinc-100">
          <thead class="bg-stone-100/70">
            <tr>
              <th
                v-for="column in USER_MANAGEMENT_COLUMNS"
                :key="column.key"
                scope="col"
                class="px-6 py-4 text-left text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase"
                :class="{ 'text-right': column.key === 'action' }"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 bg-white">
            <tr
              v-for="user in rows"
              :key="user.id"
              class="transition-colors hover:bg-sky-50/50"
              :data-testid="`user-row-${user.id}`"
            >
              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="relative size-12 shrink-0">
                    <div
                      class="flex size-12 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-sm font-bold text-sky-800 shadow-sm"
                      aria-hidden="true"
                    >
                      {{ user.initials }}
                    </div>
                    <span
                      class="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white"
                      :class="user.active ? 'bg-emerald-500' : 'bg-zinc-300'"
                      aria-hidden="true"
                    ></span>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-base leading-6 font-bold text-zinc-900">
                      {{ user.name }}
                      <span v-if="user.isSelf" class="ml-1 text-xs font-medium text-gray-500">
                        (you)
                      </span>
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
                  {{ user.role }}
                </span>
              </td>

              <td class="px-6 py-5">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  :class="
                    user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                  "
                >
                  <UIcon
                    :name="user.active ? 'i-heroicons-check-circle' : 'i-heroicons-lock-closed'"
                    class="size-3.5"
                  />
                  {{ user.active ? 'Active' : 'Locked' }}
                </span>
              </td>

              <td class="px-6 py-5">
                <p class="text-sm leading-5 text-zinc-900">{{ user.createdLabel }}</p>
              </td>

              <td class="px-6 py-5">
                <div class="flex items-center justify-end gap-1">
                  <BaseButton
                    unstyled
                    html-type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-sky-50 hover:text-sky-700"
                    :aria-label="`Edit ${user.name}`"
                    @click="openEdit(user)"
                  >
                    <UIcon name="i-heroicons-pencil-square" class="size-4" />
                  </BaseButton>
                  <BaseButton
                    unstyled
                    html-type="button"
                    class="inline-flex size-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-40"
                    :loading="statusUpdatingId === user.id"
                    :disabled="user.isSelf"
                    :title="user.isSelf ? 'You cannot lock your own account' : undefined"
                    :aria-label="user.active ? `Lock ${user.name}` : `Unlock ${user.name}`"
                    @click="openStatus(user)"
                  >
                    <UIcon
                      :name="user.active ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                      class="size-4"
                    />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="page.totalPages > 1"
        :page="page.page"
        :total-pages="page.totalPages"
        :has-prev-page="page.page > 0"
        :has-next-page="page.page + 1 < page.totalPages"
        :loading="loading"
        @prev="loadUsers(page.page - 1)"
        @next="loadUsers(page.page + 1)"
      />
    </section>

    <BaseButton
      unstyled
      html-type="button"
      aria-label="Create user"
      class="fixed right-6 bottom-6 z-10 inline-flex size-14 items-center justify-center rounded-full bg-sky-700 text-white shadow-lg transition hover:-translate-y-px hover:bg-sky-800 md:right-10 md:bottom-10"
      @click="openCreate"
    >
      <UIcon name="i-heroicons-plus" class="size-6" />
    </BaseButton>

    <ModalUserForm v-model="formOpen" :user="editingUser" />
    <ModalUserStatus v-model="statusOpen" :user="statusUser" />
  </div>
</template>
