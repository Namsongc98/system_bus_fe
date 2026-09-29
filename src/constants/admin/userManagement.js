// Tab values are BE UserRole names (sent as `role`); 'all' sends no role filter.
export const USER_MANAGEMENT_ROLE_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Customers', value: 'CUSTOMER' },
  { label: 'Drivers', value: 'DRIVER' },
  { label: 'Collectors', value: 'COLLECTOR' },
  { label: 'Admins', value: 'ADMIN' },
]

// Empty-state copy per tab.
export const USER_MANAGEMENT_EMPTY_TITLES = {
  all: 'No users yet',
  CUSTOMER: 'No customers yet',
  DRIVER: 'No drivers yet',
  COLLECTOR: 'No collectors yet',
  ADMIN: 'No admins yet',
}

// Roles an admin may create or assign (spec review 1.2 D4 = B): never ADMIN or EMPLOYEE.
export const USER_MANAGEMENT_ASSIGNABLE_ROLES = [
  { label: 'Driver', value: 'DRIVER' },
  { label: 'Collector', value: 'COLLECTOR' },
  { label: 'Customer', value: 'CUSTOMER' },
]

// "Last activity" has no BE field; spec review 1.2 D1 = A shows the creation date instead.
export const USER_MANAGEMENT_COLUMNS = [
  { key: 'profile', label: 'User profile' },
  { key: 'role', label: 'Role badge' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
  { key: 'action', label: 'Action' },
]

export const USER_MANAGEMENT_ROLE_BADGE_CLASSES = {
  ADMIN: 'bg-purple-100 text-violet-950 ring-purple-200',
  DRIVER: 'bg-blue-100 text-slate-900 ring-blue-200',
  COLLECTOR: 'bg-amber-100 text-amber-800 ring-amber-200',
  CUSTOMER: 'bg-emerald-100 text-green-950 ring-emerald-200',
  EMPLOYEE: 'bg-slate-100 text-slate-700 ring-slate-200',
}

// Sample data from the first UI pass. No longer rendered: the page shows real data or an
// empty/error state (task 1.2). Kept only because fallback constants are not deleted.
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
