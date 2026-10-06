export const TRIPS_MANAGEMENT_VIEW_TABS = [
  { label: 'Calendar', value: 'calendar' },
  { label: 'List View', value: 'list' },
]

// Values are BE TripStatus names (sent as `status`); 'all' sends no status filter.
export const TRIPS_MANAGEMENT_STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

// First option of the route filter; the rest come from GET /api/route (task 1.3).
export const TRIPS_MANAGEMENT_ALL_ROUTES_OPTION = { label: 'All Routes', value: 'all' }

// Status actions offered in the trip details modal (plan §1.3 state machine).
export const TRIPS_MANAGEMENT_STATUS_ACTIONS = {
  SCHEDULED: [
    { status: 'ONGOING', label: 'Start trip', icon: 'i-heroicons-play' },
    { status: 'CANCELLED', label: 'Cancel trip', icon: 'i-heroicons-x-circle', confirm: true },
  ],
  ONGOING: [{ status: 'COMPLETED', label: 'Complete trip', icon: 'i-heroicons-check-circle' }],
  COMPLETED: [],
  CANCELLED: [],
}

// Sample options from the first UI pass. No longer rendered (routes come from the API, "Bus Type"
// has no BE field — spec review 1.3 D7). Kept because fallback constants are not deleted.
export const TRIPS_MANAGEMENT_ROUTE_OPTIONS = [
  { label: 'All Routes', value: 'all' },
  { label: 'NYC to DC', value: 'NYC ➔ DC' },
  { label: 'BOS to PVD', value: 'BOS ➔ PVD' },
]

export const TRIPS_MANAGEMENT_BUS_TYPE_OPTIONS = [
  { label: 'All Buses', value: 'all' },
  { label: 'Luxury', value: 'Luxury' },
  { label: 'Sleeper', value: 'Sleeper' },
]

// Sample data from the first UI pass. No longer rendered: the page shows real data or an
// empty/error state (task 1.3). Kept only because fallback constants are not deleted.
export const TRIPS_MANAGEMENT_FALLBACK_TRIPS = [
  {
    id: 'tr-2045',
    code: '#TR-2045',
    shortId: 'TR-204…',
    route: 'New York ➔ Washington',
    routeShort: 'NYC ➔ DC',
    timeRange: '08:00 AM - 12:30 PM',
    operator: 'Marcus Sterling',
    operatorShort: 'Marcus S.',
    bus: 'Bus #772 - Luxury',
    busShort: 'Liner-772',
    busType: 'Luxury',
    booked: 42,
    capacity: 50,
    loadFactor: 84,
    status: 'ongoing',
    statusLabel: 'Ongoing',
    departureTime: '2026-06-10T08:00:00',
    arrivalTime: '2026-06-10T12:30:00',
  },
  {
    id: 'tr-3112',
    code: '#TR-3112',
    shortId: 'TR-311…',
    route: 'Boston ➔ Providence',
    routeShort: 'BOS ➔ PVD',
    timeRange: '10:15 AM - 11:45 AM',
    operator: 'Sarah Chen',
    operatorShort: 'Sarah C.',
    bus: 'Bus #401 - Sleeper',
    busShort: 'Sleeper-401',
    busType: 'Sleeper',
    booked: 15,
    capacity: 50,
    loadFactor: 30,
    status: 'scheduled',
    statusLabel: 'Scheduled',
    departureTime: '2026-06-13T10:15:00',
    arrivalTime: '2026-06-13T11:45:00',
  },
  {
    id: 'tr-9820',
    code: '#TR-9820',
    shortId: 'TR-982…',
    route: 'Chicago ➔ Detroit',
    routeShort: 'CHI ➔ DET',
    timeRange: '09:00 AM - 01:00 PM',
    operator: 'Daniel Kim',
    operatorShort: 'Daniel K.',
    bus: 'Bus #118 - Luxury',
    busShort: 'Liner-118',
    busType: 'Luxury',
    booked: 46,
    capacity: 52,
    loadFactor: 88,
    status: 'ongoing',
    statusLabel: 'Ongoing',
    departureTime: '2026-06-16T09:00:00',
    arrivalTime: '2026-06-16T13:00:00',
  },
  {
    id: 'tr-8821',
    code: '#TR-8821',
    shortId: 'TR-882…',
    route: 'Boston ➔ Providence',
    routeShort: 'BOS ➔ PVD',
    timeRange: '02:00 PM - 03:30 PM',
    operator: 'Olivia Lane',
    operatorShort: 'Olivia L.',
    bus: 'Bus #219 - Sleeper',
    busShort: 'Sleeper-219',
    busType: 'Sleeper',
    booked: 50,
    capacity: 50,
    loadFactor: 100,
    status: 'completed',
    statusLabel: 'Completed',
    departureTime: '2026-06-13T14:00:00',
    arrivalTime: '2026-06-13T15:30:00',
  },
]
