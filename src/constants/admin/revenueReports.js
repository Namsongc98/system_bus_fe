export const REVENUE_REPORT_PERIOD_TABS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

export const REVENUE_REPORT_FALLBACK_SUMMARY = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    value: '$482,950.00',
    trend: '+12.4%',
    trendDirection: 'up',
    caption: 'from last month',
    tone: 'sky',
  },
  {
    key: 'avgTrip',
    label: 'Avg Revenue / Trip',
    value: '$1,240.50',
    trend: '+3.2%',
    trendDirection: 'up',
    caption: 'per journey avg',
    tone: 'purple',
  },
  {
    key: 'avgBus',
    label: 'Avg Revenue / Bus',
    value: '$14,200.00',
    trend: '-1.5%',
    trendDirection: 'down',
    caption: 'idle time increased',
    tone: 'emerald',
  },
]

export const REVENUE_REPORT_FALLBACK_ROUTE_CHART = [
  { id: 'ldn-mcr', label: 'LDN-MCR', revenue: 52000, loadFactor: 80 },
  { id: 'nyc-bos', label: 'NYC-BOS', revenue: 40000, loadFactor: 73 },
  { id: 'par-lyo', label: 'PAR-LYO', revenue: 64000, loadFactor: 94 },
  { id: 'ber-muc', label: 'BER-MUC', revenue: 32000, loadFactor: 60 },
  { id: 'mad-bcn', label: 'MAD-BCN', revenue: 56000, loadFactor: 86 },
]

export const REVENUE_REPORT_FALLBACK_BUS_ROWS = [
  {
    id: 1,
    busId: '#FV-204',
    operator: 'Voyager Premium',
    earnings: '$28,450.00',
    trips: 42,
    status: 'active',
    statusLabel: 'Active',
  },
  {
    id: 2,
    busId: '#FV-112',
    operator: 'Global Link',
    earnings: '$22,100.00',
    trips: 38,
    status: 'active',
    statusLabel: 'Active',
  },
  {
    id: 3,
    busId: '#FV-405',
    operator: 'City Express',
    earnings: '$18,900.00',
    trips: 31,
    status: 'maintenance',
    statusLabel: 'Maintenance',
  },
  {
    id: 4,
    busId: '#FV-098',
    operator: 'Voyager Premium',
    earnings: '$12,450.00',
    trips: 24,
    status: 'active',
    statusLabel: 'Active',
  },
]

export const REVENUE_REPORT_FALLBACK_HEATMAP = [
  0, 1, 4, 6, 7, 8, 5, 0, 0, 2, 3, 8, 6, 2, 1, 3, 5, 7, 8, 8, 4, 0, 1, 2, 3, 4, 7, 3,
].map((value) => ({ value }))

export const REVENUE_REPORT_FALLBACK_STAFF = [
  { id: 1, name: 'Elena Rodriguez', role: 'Lead Host', score: 98, tone: 'sky' },
  { id: 2, name: 'Marcus Chen', role: 'Senior Driver', score: 92, tone: 'purple' },
  { id: 3, name: 'Sarah J. Miller', role: 'Booking Lead', score: 85, tone: 'sky' },
]
