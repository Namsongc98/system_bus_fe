export const DASHBOARD_KPIS = [
  {
    key: 'revenue',
    label: 'TOTAL REVENUE',
    valueKey: 'totalRevenue',
    trendKey: 'revenueTrendPercent',
    format: 'currency',
  },
  {
    key: 'trips',
    label: 'TRIPS COMPLETED',
    valueKey: 'tripsCompleted',
    trendKey: 'tripsTrendPercent',
    format: 'number',
  },
  {
    key: 'tickets',
    label: 'TICKETS SOLD',
    valueKey: 'ticketsSold',
    trendKey: 'ticketsTrendPercent',
    format: 'number',
  },
  {
    key: 'customers',
    label: 'ACTIVE CUSTOMERS',
    valueKey: 'activeCustomers',
    trendKey: 'customersTrendPercent',
    format: 'number',
  },
]

export const DASHBOARD_CUSTOMER_COLUMNS = [
  { key: 'customer', label: 'Customer' },
  { key: 'trips', label: 'Trips' },
  { key: 'totalSpent', label: 'Total spent' },
  { key: 'rank', label: 'Rank' },
]

export const DASHBOARD_REVENUE_PERIOD_TABS = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]
