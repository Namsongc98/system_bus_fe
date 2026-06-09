<script setup>
import { computed, onMounted, ref } from 'vue'
import RevenueBusTable from '@/components/common/RevenueBusTable.vue'
import RevenueDensityHeatmap from '@/components/common/RevenueDensityHeatmap.vue'
import RevenueRouteChart from '@/components/common/RevenueRouteChart.vue'
import RevenueSummaryCard from '@/components/common/RevenueSummaryCard.vue'
import StaffPerformancePanel from '@/components/common/StaffPerformancePanel.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BaseTabs from '@/components/elements/BaseTabs.vue'
import {
  REVENUE_REPORT_FALLBACK_BUS_ROWS,
  REVENUE_REPORT_FALLBACK_HEATMAP,
  REVENUE_REPORT_FALLBACK_ROUTE_CHART,
  REVENUE_REPORT_FALLBACK_STAFF,
  REVENUE_REPORT_FALLBACK_SUMMARY,
  REVENUE_REPORT_PERIOD_TABS,
} from '@/constants/admin/revenueReports'
import {
  getRevenueByDate,
  getRevenueByRoute,
  getRevenueReport,
  getTopCustomers,
} from '@/services/revenueService'

const selectedPeriod = ref('daily')
const loading = ref(false)
const warning = ref('')
const summaryCards = ref(REVENUE_REPORT_FALLBACK_SUMMARY)
const routeChart = ref(REVENUE_REPORT_FALLBACK_ROUTE_CHART)
const busRows = ref(REVENUE_REPORT_FALLBACK_BUS_ROWS)
const heatmapCells = ref(REVENUE_REPORT_FALLBACK_HEATMAP)
const staffRows = ref(REVENUE_REPORT_FALLBACK_STAFF)

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? response ?? null
}

function getCollection(payload, keys = []) {
  if (Array.isArray(payload)) return payload

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.records)) return payload.records

  return []
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatCurrency(value) {
  const numeric = toNumber(value, null)
  if (numeric === null) return value || '$0.00'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numeric)
}

function formatTrend(value) {
  const numeric = toNumber(value, null)
  if (numeric === null) return value || '+0.0%'
  return `${numeric > 0 ? '+' : ''}${numeric.toFixed(1)}%`
}

function normalizeSummary(payload) {
  const data = payload || {}
  const totalRevenue = firstDefined(data.totalRevenue, data.revenue, data.amount)
  const avgTrip = firstDefined(data.avgRevenuePerTrip, data.averageTripRevenue, data.avgTripRevenue)
  const avgBus = firstDefined(data.avgRevenuePerBus, data.averageBusRevenue, data.avgBusRevenue)

  return [
    {
      ...REVENUE_REPORT_FALLBACK_SUMMARY[0],
      value: formatCurrency(firstDefined(totalRevenue, REVENUE_REPORT_FALLBACK_SUMMARY[0].value)),
      trend: formatTrend(
        firstDefined(data.revenueGrowth, data.growthRate, REVENUE_REPORT_FALLBACK_SUMMARY[0].trend)
      ),
    },
    {
      ...REVENUE_REPORT_FALLBACK_SUMMARY[1],
      value: formatCurrency(firstDefined(avgTrip, REVENUE_REPORT_FALLBACK_SUMMARY[1].value)),
      trend: formatTrend(
        firstDefined(data.avgTripGrowth, REVENUE_REPORT_FALLBACK_SUMMARY[1].trend)
      ),
    },
    {
      ...REVENUE_REPORT_FALLBACK_SUMMARY[2],
      value: formatCurrency(firstDefined(avgBus, REVENUE_REPORT_FALLBACK_SUMMARY[2].value)),
      trend: formatTrend(firstDefined(data.avgBusGrowth, REVENUE_REPORT_FALLBACK_SUMMARY[2].trend)),
      trendDirection: toNumber(firstDefined(data.avgBusGrowth, -1.5)) < 0 ? 'down' : 'up',
    },
  ]
}

function normalizeRoute(item, index) {
  const label = firstDefined(
    item.label,
    item.code,
    item.routeCode,
    item.route,
    item.routeName,
    REVENUE_REPORT_FALLBACK_ROUTE_CHART[index]?.label,
    `R-${index + 1}`
  )

  return {
    id: firstDefined(item.id, item.routeId, label, index),
    label: String(label).slice(0, 10).toUpperCase(),
    revenue: toNumber(
      firstDefined(
        item.revenue,
        item.totalRevenue,
        item.amount,
        item.value,
        REVENUE_REPORT_FALLBACK_ROUTE_CHART[index]?.revenue
      )
    ),
    loadFactor: toNumber(
      firstDefined(
        item.loadFactor,
        item.loadFactorPercent,
        item.occupancyRate,
        item.percentage,
        REVENUE_REPORT_FALLBACK_ROUTE_CHART[index]?.loadFactor
      )
    ),
  }
}

function normalizeBusRow(item, index) {
  const status = String(
    firstDefined(item.status, item.state, REVENUE_REPORT_FALLBACK_BUS_ROWS[index]?.status, 'active')
  ).toLowerCase()

  return {
    id: firstDefined(item.id, item.busId, index),
    busId: firstDefined(
      item.busId,
      item.busCode,
      item.plateNumber,
      REVENUE_REPORT_FALLBACK_BUS_ROWS[index]?.busId,
      `#FV-${index + 1}`
    ),
    operator: firstDefined(
      item.operator,
      item.operatorName,
      item.company,
      item.name,
      REVENUE_REPORT_FALLBACK_BUS_ROWS[index]?.operator,
      'Operator'
    ),
    earnings: formatCurrency(
      firstDefined(
        item.earnings,
        item.totalEarnings,
        item.revenue,
        item.amount,
        REVENUE_REPORT_FALLBACK_BUS_ROWS[index]?.earnings
      )
    ),
    trips: firstDefined(
      item.trips,
      item.tripCount,
      item.totalTrips,
      REVENUE_REPORT_FALLBACK_BUS_ROWS[index]?.trips,
      0
    ),
    status: status.includes('maintenance') ? 'maintenance' : 'active',
    statusLabel: status.includes('maintenance') ? 'Maintenance' : 'Active',
  }
}

function normalizeHeatmap(items) {
  const values = items.length ? items : REVENUE_REPORT_FALLBACK_HEATMAP
  return values.slice(0, 28).map((item, index) => ({
    value: toNumber(
      firstDefined(
        item.value,
        item.density,
        item.revenueLevel,
        REVENUE_REPORT_FALLBACK_HEATMAP[index]?.value
      )
    ),
  }))
}

function normalizeStaff(item, index) {
  return {
    id: firstDefined(item.id, item.staffId, index),
    name: firstDefined(
      item.name,
      item.fullName,
      item.staffName,
      REVENUE_REPORT_FALLBACK_STAFF[index]?.name,
      'Staff member'
    ),
    role: firstDefined(
      item.role,
      item.position,
      item.title,
      REVENUE_REPORT_FALLBACK_STAFF[index]?.role,
      'Team member'
    ),
    score: toNumber(
      firstDefined(
        item.score,
        item.performance,
        item.rating,
        item.percentage,
        REVENUE_REPORT_FALLBACK_STAFF[index]?.score
      )
    ),
    tone: firstDefined(
      item.tone,
      REVENUE_REPORT_FALLBACK_STAFF[index]?.tone,
      index % 2 ? 'purple' : 'sky'
    ),
  }
}

async function fetchRevenueReports() {
  loading.value = true
  warning.value = ''

  const params = { period: selectedPeriod.value }
  const [reportResult, routeResult, dateResult, customerResult] = await Promise.allSettled([
    getRevenueReport(params),
    getRevenueByRoute(params),
    getRevenueByDate(params),
    getTopCustomers(params),
  ])

  const failedCount = [reportResult, routeResult, dateResult, customerResult].filter(
    (result) => result.status === 'rejected'
  ).length

  const reportPayload = reportResult.status === 'fulfilled' ? getPayload(reportResult.value) : null
  const routePayload = routeResult.status === 'fulfilled' ? getPayload(routeResult.value) : null
  const datePayload = dateResult.status === 'fulfilled' ? getPayload(dateResult.value) : null
  const customerPayload =
    customerResult.status === 'fulfilled' ? getPayload(customerResult.value) : null

  const routeItems = getCollection(routePayload, ['routes', 'revenueByRoute'])
  const busItems = getCollection(reportPayload, ['buses', 'busRevenue', 'units'])
  const heatmapItems = getCollection(datePayload, ['heatmap', 'density', 'revenueDensity'])
  const staffItems = getCollection(customerPayload, ['staff', 'employees', 'performance'])

  summaryCards.value = reportPayload
    ? normalizeSummary(reportPayload)
    : REVENUE_REPORT_FALLBACK_SUMMARY
  routeChart.value = routeItems.length
    ? routeItems.map(normalizeRoute)
    : REVENUE_REPORT_FALLBACK_ROUTE_CHART
  busRows.value = busItems.length ? busItems.map(normalizeBusRow) : REVENUE_REPORT_FALLBACK_BUS_ROWS
  heatmapCells.value = normalizeHeatmap(heatmapItems)
  staffRows.value = staffItems.length
    ? staffItems.map(normalizeStaff)
    : REVENUE_REPORT_FALLBACK_STAFF

  const allEmpty =
    !reportPayload &&
    !routeItems.length &&
    !busItems.length &&
    !heatmapItems.length &&
    !staffItems.length

  if (failedCount || allEmpty) {
    warning.value = allEmpty
      ? 'Revenue APIs returned no records. Showing sample revenue report data.'
      : 'Some revenue data is unavailable. Showing available data with sample fallbacks.'
  }

  loading.value = false
}

function handlePeriodChange(period) {
  selectedPeriod.value = period
  fetchRevenueReports()
}

onMounted(fetchRevenueReports)
</script>

<template>
  <div class="flex flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-10">
    <header
      class="sticky top-0 z-20 -mx-4 border-b border-slate-300/10 bg-white/70 px-4 py-4 backdrop-blur-md md:-mx-8 md:px-8"
    >
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 class="text-2xl leading-8 font-extrabold text-zinc-900">Revenue Reports</h1>
          <p class="text-sm leading-5 text-gray-700">
            Analyzing system performance and financial growth
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <BaseTabs
            :model-value="selectedPeriod"
            :options="REVENUE_REPORT_PERIOD_TABS"
            :disabled="loading"
            aria-label="Revenue report period"
            @update:model-value="handlePeriodChange"
          />
          <BaseButton
            type="outline"
            size="sm"
            html-type="button"
            aria-label="Selected date range Oct 01 to Oct 31"
          >
            <template #icon-left>
              <span class="size-3.5 rounded-sm bg-gray-700"></span>
            </template>
            Oct 01 - Oct 31
          </BaseButton>
          <BaseButton size="sm" html-type="button" aria-label="Export revenue report PDF">
            <template #icon-left>
              <span class="size-3 rounded-sm bg-white"></span>
            </template>
            Export PDF
          </BaseButton>
        </div>
      </div>
    </header>

    <BaseEmptyState v-if="warning" :title="warning" tone="warning" class="text-left" />

    <section
      v-if="loading"
      class="rounded-2xl bg-white/70 p-5 text-sm font-semibold text-sky-700 shadow-sm"
    >
      Loading revenue reports...
    </section>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <RevenueSummaryCard v-for="card in summaryCards" :key="card.key" :card="card" />
    </section>

    <section class="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
      <div class="flex min-w-0 flex-col gap-8">
        <div class="overflow-x-auto">
          <RevenueRouteChart :routes="routeChart" />
        </div>
        <RevenueBusTable :rows="busRows" />
      </div>

      <aside class="flex flex-col gap-8 xl:pb-60">
        <RevenueDensityHeatmap :cells="heatmapCells" />
        <StaffPerformancePanel :staff="staffRows" />
      </aside>
    </section>
  </div>
</template>
