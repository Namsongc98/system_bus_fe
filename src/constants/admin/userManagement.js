export const USER_MANAGEMENT_ROLE_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Customers', value: 'customer' },
  { label: 'Drivers', value: 'driver' },
  { label: 'Collectors', value: 'collector' },
  { label: 'Admins', value: 'admin' },
]

export const USER_MANAGEMENT_COLUMNS = [
  { key: 'profile', label: 'User profile' },
  { key: 'role', label: 'Role badge' },
  { key: 'status', label: 'Status' },
  { key: 'lastActivity', label: 'Last activity' },
  { key: 'action', label: 'Action' },
]

export const USER_MANAGEMENT_ROLE_BADGE_CLASSES = {
  admin: 'bg-purple-100 text-violet-950 ring-purple-200',
  driver: 'bg-blue-100 text-slate-900 ring-blue-200',
  collector: 'bg-amber-100 text-amber-800 ring-amber-200',
  customer: 'bg-emerald-100 text-green-950 ring-emerald-200',
  user: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export const USER_MANAGEMENT_FALLBACK_USERS = [
  {
    id: 'sample-admin',
    name: 'Sarah Jenkins',
    email: 'sarah.j@fluidvoyager.com',
    role: 'admin',
    active: true,
    lastActivity: '2 mins ago',
  },
  {
    id: 'sample-driver',
    name: 'Marcus Thorne',
    email: 'm.thorne@voyager.fleet',
    role: 'driver',
    active: true,
    lastActivity: '1 hour ago',
  },
  {
    id: 'sample-collector',
    name: 'Elena Rodriguez',
    email: 'elena.r@voyager.support',
    role: 'collector',
    active: true,
    lastActivity: 'Yesterday',
  },
  {
    id: 'sample-customer',
    name: 'Liam Peterson',
    email: 'liam.p88@gmail.com',
    role: 'customer',
    active: false,
    lastActivity: 'No recent activity',
  },
]
