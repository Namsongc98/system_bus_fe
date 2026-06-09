import { ROUTE_NAMES } from '@/constants/routes'

export const USER_HEADER_NAV_LINKS = [
  { label: 'Home', name: ROUTE_NAMES.TRIP_VIEW },
  { label: 'My Tickets', name: ROUTE_NAMES.MY_TICKETS },
  { label: 'Profile', name: ROUTE_NAMES.PROFILE },
]

export const USER_FOOTER_QUICK_LINKS = [
  { label: 'Trips', name: ROUTE_NAMES.TRIP_VIEW },
  { label: 'My Tickets', name: ROUTE_NAMES.ADMIN_TICKETS },
  { label: 'Profile', name: ROUTE_NAMES.PROFILE },
  { label: 'Sign In', name: ROUTE_NAMES.LOGIN },
]

export const USER_FOOTER_SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'i-heroicons-globe-alt', href: '#' },
  { label: 'Twitter', icon: 'i-heroicons-chat-bubble-left-ellipsis', href: '#' },
  { label: 'Instagram', icon: 'i-heroicons-camera', href: '#' },
]
