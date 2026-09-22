<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseDataTable from '@/components/elements/BaseDataTable.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BaseTrendChart from '@/components/elements/BaseTrendChart.vue'
import {
  DASHBOARD_CUSTOMER_COLUMNS,
  DASHBOARD_KPIS,
  DASHBOARD_REVENUE_PERIOD_TABS,
} from '@/constants/admin/dashboard'
import { ROUTE_NAMES } from '@/constants/routes'
import { useAdminStore } from '@/stores/admin'
import ticketIcon from '@/assets/icons/TicketIcon.svg'

const adminStore = useAdminStore()
const router = useRouter()
const {
  dashboard,
  revenueTrend,
  dashboardLoading,
  revenueLoading,
  dashboardError,
  revenueError,
} = storeToRefs(adminStore)
const selectedRevenuePeriod = ref('monthly')

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatTrend(value) {
  if (value === null || value === undefined) return 'N/A'
  const number = Number(value)
  return `${number > 0 ? '+' : ''}${number.toFixed(1)}%`
}

const kpiCards = computed(() => {
  const kpis = dashboard.value?.kpis || {}
  return DASHBOARD_KPIS.map((card) => {
    const rawValue = kpis[card.valueKey]
    const trend = kpis[card.trendKey]
    return {
      ...card,
      value: card.format === 'currency' ? formatCurrency(rawValue) : formatNumber(rawValue),
      trend: formatTrend(trend),
      trendValue: trend,
    }
  })
})

const revenueChartItems = computed(() => {
  const heightClasses = ['h-20', 'h-28', 'h-24', 'h-36', 'h-32', 'h-44']
  return revenueTrend.value.map((item, index) => ({
    label: item.label,
    value: Number(item.amount || 0),
    heightClass: heightClasses[index] || 'h-24',
  }))
})

const topRoutes = computed(() => dashboard.value?.topRoutes || [])
const loyalCustomers = computed(() =>
  (dashboard.value?.loyalCustomers || []).map((customer) => ({
    ...customer,
    id: customer.customerId,
    totalSpent: formatCurrency(customer.totalSpent),
  }))
)
const recentBookings = computed(() =>
  (dashboard.value?.recentBookings || []).map((booking) => ({
    id: booking.ticketId,
    title: `Ticket #${booking.ticketId} sold`,
    description: `${booking.customer || 'Unknown customer'} • ${booking.routeName}${
      booking.seatNumber ? ` • Seat ${booking.seatNumber}` : ''
    }`,
    time: formatRelativeTime(booking.occurredAt),
  }))
)

function formatRelativeTime(value) {
  if (!value) return ''
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (elapsedSeconds < 60) return 'Just now'
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h ago`
  return `${Math.floor(elapsedSeconds / 86400)}d ago`
}

function goToNewBooking() {
  router.push({ name: ROUTE_NAMES.ADMIN_TICKETS })
}

function handleRevenuePeriodChange(period) {
  selectedRevenuePeriod.value = period
  adminStore.fetchRevenue({ period })
}

onMounted(() => {
  Promise.allSettled([
    adminStore.fetchDashboard(),
    adminStore.fetchRevenue({ period: selectedRevenuePeriod.value }),
  ])
})
</script>

<template>
  <div class="flex flex-col gap-8 px-4 py-6 md:px-8">
    <section class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl leading-10 font-extrabold text-sky-700">Dashboard</h1>
        <p class="text-base leading-6 text-gray-700">
          Current insight into Fluid Voyager operations.
        </p>
      </div>

      <BaseButton
        label="New Booking"
        size="lg"
        class="w-full md:w-auto"
        data-testid="new-booking-button"
        @click="goToNewBooking"
      >
        <template #icon-left>
          <span class="size-2 rounded-full bg-white"></span>
        </template>
        New Booking
      </BaseButton>
    </section>

    <div
      v-if="dashboardError"
      class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800"
      role="alert"
    >
      {{ dashboardError }}
    </div>

    <div
      v-if="dashboardLoading"
      class="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-sky-700 shadow-sm backdrop-blur-md"
    >
      Loading dashboard data...
    </div>

    <section class="grid grid-cols-1 overflow-hidden rounded-[32px] md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in kpiCards"
        :key="card.key"
        class="flex h-40 flex-col justify-between bg-white/70 px-6 pt-6 pb-4 shadow-sm ring-1 ring-white/40 backdrop-blur-md"
      >
        <div class="flex items-start justify-between gap-4">
          <p
            class="text-sm leading-5 font-medium tracking-wide whitespace-pre-line text-gray-700 uppercase"
          >
            {{ card.label.replace(' ', '\n') }}
          </p>
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs leading-4"
            :class="
              card.trendValue === null || card.trendValue === undefined
                ? 'bg-slate-200 text-slate-700'
                : Number(card.trendValue) >= 0
                  ? 'bg-emerald-500/20 text-emerald-800'
                  : 'bg-rose-200/30 text-red-700'
            "
          >
            <span
              class="h-1.5 w-3 rounded-full"
              :class="
                card.trendValue === null || card.trendValue === undefined
                  ? 'bg-slate-500'
                  : Number(card.trendValue) >= 0
                    ? 'bg-emerald-800'
                    : 'bg-red-700'
              "
            ></span>
            {{ card.trend }}
          </span>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-2xl leading-8 font-normal text-zinc-900">{{ card.value }}</p>
          <!-- <div class="flex h-8 items-end gap-1 overflow-hidden">
            <span
              v-for="(bar, index) in card.sparkline"
              :key="`${card.key}-${index}`"
              class="w-full rounded-full opacity-80"
              :class="[bar, card.accent]"
            ></span>
          </div> -->
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-8 xl:grid-cols-[3fr_2fr]">
      <BaseTrendChart
        v-model="selectedRevenuePeriod"
        title="Revenue Trend"
        description="Monthly breakdown of income performance"
        :items="revenueChartItems"
        :tabs="DASHBOARD_REVENUE_PERIOD_TABS"
        :loading="revenueLoading"
        empty-title="No revenue data"
        empty-description="Revenue performance will appear when report data is available."
        @update:model-value="handleRevenuePeriodChange"
      />
      <p v-if="revenueError" class="sr-only" role="alert">{{ revenueError }}</p>

      <article
        class="flex flex-col gap-10 rounded-[32px] bg-white/70 px-6 pt-8 pb-10 shadow-sm backdrop-blur-md md:px-8"
      >
        <div>
          <h2 class="text-lg leading-7 font-normal text-zinc-900">Top Routes</h2>
          <p class="text-xs leading-4 text-gray-700">Performance by destination volume</p>
        </div>

        <div v-if="topRoutes.length" class="flex flex-col gap-6">
          <div v-for="route in topRoutes" :key="route.id || route.name" class="flex flex-col gap-2">
            <div class="flex justify-between gap-4">
              <p class="text-xs leading-4 font-bold text-zinc-900">{{ route.name }}</p>
              <p class="text-xs leading-4 font-bold whitespace-nowrap text-gray-700">
                {{ formatNumber(route.ticketsSold) }} tickets
              </p>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                class="h-2 rounded-full bg-sky-700"
                :style="{ width: `${Math.min(100, Number(route.sharePercent || 0))}%` }"
              ></div>
            </div>
          </div>
        </div>
        <BaseEmptyState
          v-else
          title="No route performance"
          description="Successful ticket sales for this month will appear here."
        />
      </article>
    </section>

    <section class="grid grid-cols-1 gap-8 xl:grid-cols-[3fr_2fr]">
      <article class="flex flex-col gap-6 rounded-[32px] bg-stone-100 px-6 pt-8 pb-10 md:px-8">
        <h2 class="text-lg leading-7 font-normal text-zinc-900">Loyal Voyagers</h2>
        <BaseDataTable
          :columns="DASHBOARD_CUSTOMER_COLUMNS"
          :rows="loyalCustomers"
          row-key="id"
          empty-title="No loyal customers yet"
          empty-description="Customer ranking will appear when booking data is available."
        >
          <template #cell-customer="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 to-violet-200 text-xs font-bold text-sky-900"
              >
                {{ row.customer?.charAt(0) || 'C' }}
              </div>
              <span class="font-medium text-zinc-900">{{ row.customer }}</span>
            </div>
          </template>
          <template #cell-totalSpent="{ value }">
            <span class="font-bold text-zinc-900">{{ value }}</span>
          </template>
          <template #cell-rank="{ value }">
            <span class="inline-flex rounded-md bg-sky-100 px-2 text-[10px] leading-5 font-bold">
              #{{ value }}
            </span>
          </template>
        </BaseDataTable>
      </article>

      <article class="flex flex-col gap-6 rounded-[32px] bg-stone-100 p-6 md:p-8">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg leading-7 font-bold text-zinc-900">Recent Bookings</h2>
          <div class="flex items-center gap-2">
            <span class="relative flex size-2">
              <span
                class="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-800 opacity-75"
              ></span>
              <span class="relative inline-flex size-2 rounded-full bg-emerald-800"></span>
            </span>
            <span class="text-xs leading-4 font-bold text-emerald-800">LATEST ACTIVITY</span>
          </div>
        </div>

        <div v-if="recentBookings.length" class="flex flex-col gap-4">
          <div
            v-for="booking in recentBookings"
            :key="booking.id || booking.title"
            class="flex items-center justify-between gap-4 rounded-[32px] bg-white/60 p-4 outline outline-1 outline-white/20"
          >
            <div class="flex min-w-0 items-center gap-4">
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-700/10 text-sky-700"
              >
                <img :src="ticketIcon" alt="" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm leading-5 font-bold text-zinc-900">
                  {{ booking.title }}
                </p>
                <p class="truncate text-[10px] leading-4 text-gray-700">
                  {{ booking.description }}
                </p>
              </div>
            </div>
            <p class="shrink-0 text-xs leading-4 font-medium text-gray-700">{{ booking.time }}</p>
          </div>
        </div>
        <BaseEmptyState
          v-else
          title="No recent bookings"
          description="Recent booking activity will appear here."
        />
      </article>
    </section>
  </div>
</template>
