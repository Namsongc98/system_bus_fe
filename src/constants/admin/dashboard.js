export const DASHBOARD_FALLBACK_KPIS = [
  {
    key: 'revenue',
    label: 'TOTAL REVENUE',
    value: '₫125.5M',
    trend: '+12.5%',
    positive: true,
    accent: 'bg-sky-700',
    sparkline: ['h-3', 'h-5', 'h-4', 'h-7', 'h-6', 'h-8'],
  },
  {
    key: 'trips',
    label: 'TRIPS COMPLETED',
    value: '342',
    trend: '+8.4%',
    positive: true,
    accent: 'bg-violet-700',
    sparkline: ['h-4', 'h-6', 'h-5', 'h-9', 'h-7', 'h-10'],
  },
  {
    key: 'tickets',
    label: 'TICKETS SOLD',
    value: '8,450',
    trend: '-2.1%',
    positive: false,
    accent: 'bg-emerald-800',
    sparkline: ['h-8', 'h-7', 'h-6', 'h-5', 'h-4', 'h-3'],
  },
  {
    key: 'customers',
    label: 'ACTIVE CUSTOMERS',
    value: '1,245',
    trend: '+18.2%',
    positive: true,
    accent: 'bg-sky-700',
    sparkline: ['h-3', 'h-4', 'h-5', 'h-5', 'h-7', 'h-8'],
  },
]

export const DASHBOARD_FALLBACK_REVENUE_TREND = [
  { label: 'JAN', value: 38, heightClass: 'h-20' },
  { label: 'FEB', value: 52, heightClass: 'h-28' },
  { label: 'MAR', value: 48, heightClass: 'h-24' },
  { label: 'APR', value: 64, heightClass: 'h-36' },
  { label: 'MAY', value: 58, heightClass: 'h-32' },
  { label: 'JUN', value: 76, heightClass: 'h-44' },
]

export const DASHBOARD_FALLBACK_TOP_ROUTES = [
  {
    id: 'hanoi-danang',
    name: 'Hanoi - Da Nang',
    tickets: '2,420 tickets',
    widthClass: 'w-[88%]',
    colorClass: 'bg-sky-700',
  },
  {
    id: 'hcmc-dalat',
    name: 'HCMC - Da Lat',
    tickets: '1,980 tickets',
    widthClass: 'w-[74%]',
    colorClass: 'bg-violet-700',
  },
  {
    id: 'hanoi-sapa',
    name: 'Hanoi - Sapa',
    tickets: '1,240 tickets',
    widthClass: 'w-[56%]',
    colorClass: 'bg-emerald-800',
  },
  {
    id: 'hcmc-nhatrang',
    name: 'HCMC - Nha Trang',
    tickets: '850 tickets',
    widthClass: 'w-[42%]',
    colorClass: 'bg-slate-300',
  },
]

export const DASHBOARD_FALLBACK_LOYAL_CUSTOMERS = [
  {
    id: 1,
    customer: 'Nguyen Van A',
    trips: 24,
    totalSpent: '₫18.2M',
    status: 'PLATINUM',
    statusClass: 'bg-blue-200 text-slate-900',
  },
  {
    id: 2,
    customer: 'Tran Thi B',
    trips: 18,
    totalSpent: '₫12.5M',
    status: 'GOLD',
    statusClass: 'bg-purple-200 text-violet-950',
  },
  {
    id: 3,
    customer: 'Le Van C',
    trips: 12,
    totalSpent: '₫8.9M',
    status: 'SILVER',
    statusClass: 'bg-stone-200 text-gray-700',
  },
]

export const DASHBOARD_FALLBACK_LIVE_BOOKINGS = [
  {
    id: 1,
    title: 'Ticket #FV-2849 Sold',
    description: 'Passenger: Pham Minh D • HN-DN',
    time: '2m ago',
    toneClass: 'bg-sky-700/10 text-sky-700',
    iconKey: 'ticket',
  },
  {
    id: 2,
    title: 'Group Booking Confirmed',
    description: '5 Pax • Saigon Express • 14:00',
    time: '8m ago',
    toneClass: 'bg-violet-700/10 text-violet-700',
    iconKey: 'groupBooking',
  },
  {
    id: 3,
    title: 'Invoice Paid',
    description: '₫2,450,000 via VNPay',
    time: '15m ago',
    toneClass: 'bg-emerald-800/10 text-emerald-800',
    iconKey: 'money',
  },
  {
    id: 4,
    title: 'Pre-order: Premium Seat',
    description: 'Seat A12 • Da Nang Nightliner',
    time: '24m ago',
    toneClass: 'bg-sky-700/10 text-sky-700',
    iconKey: 'preOrder',
  },
]

export const DASHBOARD_CUSTOMER_COLUMNS = [
  { key: 'customer', label: 'Customer' },
  { key: 'trips', label: 'Trips' },
  { key: 'totalSpent', label: 'Total spent' },
  { key: 'status', label: 'Status' },
]

export const DASHBOARD_REVENUE_PERIOD_TABS = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]
