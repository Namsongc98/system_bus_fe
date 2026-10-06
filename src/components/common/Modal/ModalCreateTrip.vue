<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useTripStore } from '@/stores/trip'

// Form fields validated on each step.
const STEP_FIELDS = {
  route: ['routeId'],
  resources: ['busId', 'driverId'],
  schedule: ['departureTime', 'arrivalTime'],
  review: [],
}

const WIZARD_STEPS = [
  { key: 'route', label: 'Route' },
  { key: 'resources', label: 'Resources' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'review', label: 'Review' },
]

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // TripResponse to edit (spec review 1.3 S19); null opens the wizard in create mode.
  trip: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'saved'])

const tripStore = useTripStore()
const { saving: creating } = storeToRefs(tripStore)
const toast = useToast()

const currentStep = ref('route')
const optionsLoading = ref(false)
const optionsError = ref('')
const hasLoadedOptions = ref(false)
const routes = ref([])
const buses = ref([])
const drivers = ref([])
const errors = reactive({})
// BE refusal on submit (409 overlap, 400 past departure…), shown on the Review step.
const submitError = ref('')
const form = reactive({
  routeId: '',
  busId: '',
  driverId: '',
  departureTime: '',
  arrivalTime: '',
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Escape / overlay must not close the wizard while a save is in flight.
    if (!value && creating.value) return
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

const isEdit = computed(() => !!props.trip?.id)

const currentStepIndex = computed(() =>
  Math.max(
    WIZARD_STEPS.findIndex((step) => step.key === currentStep.value),
    0
  )
)
const isReviewStep = computed(() => currentStep.value === 'review')
const canNavigate = computed(() => !optionsLoading.value && !creating.value)

// Edit mode: the trip's current route / bus / driver stay selectable-looking even when they are no
// longer offered (inactive route, bus in maintenance, locked driver), marked "(unavailable)", so the
// select is not blank and the BE refusal makes sense.
function withCurrent(list, current, normalize) {
  if (!isEdit.value || !current?.id || list.some((item) => sameId(item.id, current.id))) return list
  const option = normalize(current, 0)
  return [{ ...option, label: `${option.label} (unavailable)` }, ...list]
}

const routeList = computed(() => withCurrent(routes.value, props.trip?.route, normalizeRoute))
const busList = computed(() => withCurrent(buses.value, props.trip?.bus, normalizeBus))
const driverList = computed(() => withCurrent(drivers.value, props.trip?.driver, normalizeDriver))

const routeOptions = computed(() =>
  routeList.value.map((route) => ({
    label: route.label,
    value: route.id,
  }))
)

const busOptions = computed(() =>
  busList.value.map((bus) => ({
    label: bus.label,
    value: bus.id,
  }))
)

const driverOptions = computed(() =>
  driverList.value.map((driver) => ({
    label: driver.label,
    value: driver.id,
  }))
)

const selectedRoute = computed(() =>
  routeList.value.find((route) => sameId(route.id, form.routeId))
)
const selectedBus = computed(() => busList.value.find((bus) => sameId(bus.id, form.busId)))
const selectedDriver = computed(() =>
  driverList.value.find((driver) => sameId(driver.id, form.driverId))
)

const durationLabel = computed(() => {
  const minutes = durationMinutes.value
  if (!minutes) return 'Pending'

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return `${hours}h ${String(remainder).padStart(2, '0')}m duration`
})

const durationMinutes = computed(() => {
  if (!form.departureTime || !form.arrivalTime) return 0

  const diff = new Date(form.arrivalTime).getTime() - new Date(form.departureTime).getTime()
  if (!Number.isFinite(diff) || diff <= 0) return 0

  return Math.round(diff / 60000)
})

function sameId(left, right) {
  return String(left) === String(right)
}

function resolveOptionValue(options, value) {
  return options.find((option) => sameId(option.value, value))?.value ?? value
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function normalizeRoute(route, index) {
  const origin = firstDefined(route.startPoint, route.origin, route.from, route.departure, 'Origin')
  const destination = firstDefined(
    route.endPoint,
    route.destination,
    route.to,
    route.arrival,
    'Destination'
  )
  const label = firstDefined(route.routeName, route.name, `${origin} - ${destination}`)
  const distance = firstDefined(route.distanceKm, route.distance, route.lengthKm, '')

  return {
    id: firstDefined(route.id, route.routeId, index),
    label,
    origin,
    destination,
    distance,
  }
}

function normalizeBus(bus, index) {
  const busNumber = firstDefined(
    bus.busNumber,
    bus.code,
    bus.name,
    bus.plateNumber,
    `Bus #${index + 1}`
  )
  const plate = firstDefined(bus.licensePlate, bus.plate, bus.plateNumber, '')
  const capacity = firstDefined(bus.capacity, bus.seats, bus.seatCount, '')

  return {
    id: firstDefined(bus.id, bus.busId, index),
    label: plate ? `${busNumber} - ${plate}` : busNumber,
    busNumber,
    capacity,
    status: String(firstDefined(bus.status, bus.state, '')).toUpperCase(),
  }
}

function normalizeDriver(driver, index) {
  const email = firstDefined(driver.email, '')
  const name = firstDefined(
    driver.name,
    driver.fullName,
    driver.username,
    email,
    `Driver #${index + 1}`
  )

  return {
    id: firstDefined(driver.id, driver._id, driver.userId, index),
    label: email && email !== name ? `${name} - ${email}` : name,
    name,
    detail: firstDefined(driver.title, driver.driverStatus, driver.role, 'Driver'),
  }
}

async function loadOptions() {
  if (hasLoadedOptions.value || optionsLoading.value) return

  optionsLoading.value = true
  optionsError.value = ''

  // finally: whatever happens, the wizard must not stay disabled (B37 d).
  try {
    // A null list is a failed request (the store keeps the service calls, B35 e).
    const options = await tripStore.fetchFormOptions()
    const failed = !options.routes || !options.buses || !options.drivers

    routes.value = (options.routes || []).map(normalizeRoute)
    buses.value = (options.buses || [])
      .map(normalizeBus)
      .filter((bus) => bus.status !== 'MAINTENANCE')
    drivers.value = (options.drivers || [])
      // A locked driver cannot be assigned (task 1.2).
      .filter((driver) => driver.active !== false)
      .map(normalizeDriver)

    // Aborted with the session (logout): nothing to report; the next open loads again.
    if (failed && !options.canceled) {
      optionsError.value =
        'Some trip setup data is unavailable. Please retry before creating a trip.'
    } else if (!failed && (!routes.value.length || !buses.value.length || !drivers.value.length)) {
      optionsError.value =
        'Routes, buses, or drivers are unavailable. Please add required resources first.'
    }

    // Only a complete load is cached; a failed one is retried the next time the wizard opens.
    hasLoadedOptions.value = !failed
  } catch {
    optionsError.value = 'Some trip setup data is unavailable. Please retry before creating a trip.'
  } finally {
    optionsLoading.value = false
  }
}

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

function validateStep(step = currentStep.value, options = {}) {
  if (!options.preserveErrors) clearErrors()

  if (step === 'route' && !form.routeId) errors.routeId = 'Select a route'

  if (step === 'resources') {
    if (!form.busId) errors.busId = 'Select a bus unit'
    if (!form.driverId) errors.driverId = 'Select a driver'
  }

  if (step === 'schedule') {
    if (!form.departureTime) errors.departureTime = 'Choose departure time'
    if (!form.arrivalTime) errors.arrivalTime = 'Choose arrival time'

    if (form.departureTime && form.arrivalTime && !durationMinutes.value) {
      errors.arrivalTime = 'Arrival must be after departure'
    }
  }

  return !Object.keys(errors).length
}

function validateAllSteps() {
  clearErrors()
  const validRoute = validateStep('route', { preserveErrors: true })
  const validResources = validateStep('resources', { preserveErrors: true })
  const validSchedule = validateStep('schedule', { preserveErrors: true })

  return validRoute && validResources && validSchedule
}

function goNext() {
  if (!canNavigate.value || !validateStep()) return

  currentStep.value =
    WIZARD_STEPS[Math.min(currentStepIndex.value + 1, WIZARD_STEPS.length - 1)].key
}

function goBack() {
  if (!canNavigate.value || currentStepIndex.value === 0) return

  // Keep errors of earlier steps: a 400 from the BE on Review is shown on the step it belongs to.
  STEP_FIELDS[currentStep.value]?.forEach((field) => delete errors[field])
  submitError.value = ''
  currentStep.value = WIZARD_STEPS[Math.max(currentStepIndex.value - 1, 0)].key
}

// TripResponse times are "2030-01-01T08:00:00"; a datetime-local input wants "2030-01-01T08:00".
function toInputDateTime(value) {
  return value ? String(value).slice(0, 16) : ''
}

function resetForm() {
  form.routeId = props.trip?.route?.id ?? ''
  form.busId = props.trip?.bus?.id ?? ''
  form.driverId = props.trip?.driver?.id ?? ''
  form.departureTime = toInputDateTime(props.trip?.departureTime)
  form.arrivalTime = toInputDateTime(props.trip?.arrivalTime)
  currentStep.value = 'route'
  submitError.value = ''
  clearErrors()
}

function closeModal() {
  if (creating.value) return
  resetForm()
  isOpen.value = false
}

async function submitTrip() {
  if (!validateAllSteps()) return
  submitError.value = ''

  // Status and revenue are set by the server (spec review 1.3 S3).
  const payload = {
    routeId: resolveOptionValue(routeOptions.value, form.routeId),
    busId: resolveOptionValue(busOptions.value, form.busId),
    driverId: resolveOptionValue(driverOptions.value, form.driverId),
    departureTime: form.departureTime,
    arrivalTime: form.arrivalTime,
  }

  try {
    const savedTrip = isEdit.value
      ? await tripStore.update(props.trip.id, payload)
      : await tripStore.create(payload)

    toast.success(isEdit.value ? 'Trip updated successfully' : 'Trip created successfully')
    isOpen.value = false
    emit('saved', savedTrip)
  } catch (err) {
    // Stay on Review with the data kept; "Back to Schedule" lets the admin fix it (design §4).
    Object.entries(err?.errors ?? {}).forEach(([field, message]) => {
      if (field in form) errors[field] = message
    })
    submitError.value = err?.message || 'Unable to save trip'
    toast.error(submitError.value)
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm()
      loadOptions()
    }
  },
  { immediate: true }
)
</script>

<template>
  <BaseModal v-model="isOpen" size="xl">
    <form
      class="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[32px] bg-white/90 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.06)] outline outline-1 outline-offset-[-1px] outline-slate-300/20 backdrop-blur-md"
      @submit.prevent="submitTrip"
    >
      <header class="flex flex-col gap-6 px-6 pt-6 pb-4 md:px-8 md:pt-8">
        <div class="flex items-center justify-between gap-6">
          <div class="flex min-w-0 items-center gap-4">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-700 to-violet-500 text-white shadow-lg"
            >
              <UIcon name="i-heroicons-calendar-days" class="size-6" />
            </div>
            <div class="min-w-0">
              <h2 class="text-2xl leading-8 font-bold text-zinc-900">
                {{ isEdit ? 'Edit Trip' : 'Schedule New Trip' }}
              </h2>
              <p class="text-sm leading-5 font-medium text-gray-700">
                Fluid Voyager Admin Terminal
              </p>
            </div>
          </div>
          <BaseButton
            unstyled
            html-type="button"
            class="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-stone-100"
            aria-label="Close create trip modal"
            @click="closeModal"
          >
            <UIcon name="i-heroicons-x-mark" class="size-5" />
          </BaseButton>
        </div>

        <ol class="grid grid-cols-4 gap-2 px-1">
          <li
            v-for="(step, index) in WIZARD_STEPS"
            :key="step.key"
            class="relative flex flex-col items-center gap-2"
          >
            <div
              v-if="index < WIZARD_STEPS.length - 1"
              class="absolute top-4 left-1/2 h-0.5 w-full"
              :class="index < currentStepIndex ? 'bg-sky-700' : 'bg-stone-200'"
            ></div>
            <span
              class="relative z-10 flex size-8 items-center justify-center rounded-full text-xs leading-4 font-bold shadow-[0px_0px_0px_4px_rgba(255,255,255,1)]"
              :class="
                index <= currentStepIndex ? 'bg-sky-700 text-white' : 'bg-stone-200 text-gray-700'
              "
            >
              {{ index + 1 }}
            </span>
            <span
              class="relative z-10 text-xs leading-4 font-semibold tracking-tight"
              :class="index <= currentStepIndex ? 'text-sky-700' : 'text-gray-500'"
            >
              {{ step.label }}
            </span>
          </li>
        </ol>
      </header>

      <div class="flex flex-col gap-6 overflow-y-auto px-6 pt-4 pb-8 md:px-8">
        <BaseEmptyState
          v-if="optionsError"
          :title="optionsError"
          tone="warning"
          class="text-left"
        />

        <section v-if="currentStep === 'route'" class="flex flex-col gap-6">
          <div>
            <h3 class="text-lg leading-7 font-bold text-zinc-900">Route</h3>
            <p class="text-sm text-gray-700">Select the corridor for this scheduled trip.</p>
          </div>

          <label class="flex flex-col gap-1">
            <span class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase"
              >Route</span
            >
            <USelect
              :model-value="form.routeId"
              :items="routeOptions"
              value-key="value"
              label-key="label"
              :disabled="optionsLoading || creating"
              placeholder="Search routes..."
              :ui="{ base: 'w-full rounded-2xl bg-stone-100 px-4 py-3' }"
              @update:model-value="form.routeId = $event"
            />
            <span v-if="errors.routeId" class="text-xs text-red-500">{{ errors.routeId }}</span>
          </label>

          <section
            class="relative overflow-hidden rounded-[32px] bg-white p-6 shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p class="text-[10px] leading-4 tracking-wide text-sky-700 uppercase">Departure</p>
                <p class="truncate text-2xl leading-8 text-zinc-900">
                  {{ selectedRoute?.origin || 'Select departure' }}
                </p>
              </div>
              <div class="flex w-20 shrink-0 flex-col items-center gap-1">
                <UIcon name="i-heroicons-arrow-long-right" class="size-8 text-sky-700" />
                <span class="text-[10px] leading-4 font-bold text-gray-700">
                  {{ selectedRoute?.distance ? `${selectedRoute.distance} km` : '-- km' }}
                </span>
              </div>
              <div class="min-w-0 flex-1 text-right">
                <p class="text-[10px] leading-4 font-bold tracking-wide text-violet-700 uppercase">
                  Destination
                </p>
                <p class="truncate text-2xl leading-8 font-black text-zinc-900">
                  {{ selectedRoute?.destination || 'Select destination' }}
                </p>
              </div>
            </div>
          </section>
        </section>

        <section v-else-if="currentStep === 'resources'" class="flex flex-col gap-6">
          <div>
            <h3 class="text-lg leading-7 font-bold text-zinc-900">Resources</h3>
            <p class="text-sm text-gray-700">Assign the bus unit and driver for this route.</p>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-1">
              <span class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                Bus Unit
              </span>
              <USelect
                :model-value="form.busId"
                :items="busOptions"
                value-key="value"
                label-key="label"
                :disabled="optionsLoading || creating"
                placeholder="Select available bus"
                :ui="{ base: 'w-full rounded-2xl bg-stone-100 px-4 py-3' }"
                @update:model-value="form.busId = $event"
              />
              <span v-if="errors.busId" class="text-xs text-red-500">{{ errors.busId }}</span>
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                Assigned Driver
              </span>
              <USelect
                :model-value="form.driverId"
                :items="driverOptions"
                value-key="value"
                label-key="label"
                :disabled="optionsLoading || creating"
                placeholder="Select driver"
                :ui="{ base: 'w-full rounded-2xl bg-stone-100 px-4 py-3' }"
                @update:model-value="form.driverId = $event"
              />
              <span v-if="errors.driverId" class="text-xs text-red-500">{{ errors.driverId }}</span>
            </label>
          </div>

          <div
            class="grid grid-cols-1 overflow-hidden rounded-[32px] bg-white shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10 md:grid-cols-2"
          >
            <div class="flex flex-col gap-4 p-6">
              <p class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                Fleet Resource
              </p>
              <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-[32px] bg-stone-200">
                  <UIcon name="i-heroicons-truck" class="size-6 text-zinc-900" />
                </div>
                <div>
                  <p class="text-sm leading-5 font-bold text-zinc-900">
                    {{ selectedBus?.label || 'No bus selected' }}
                  </p>
                  <p class="text-xs leading-4 font-medium text-gray-700">
                    {{
                      selectedBus?.capacity
                        ? `${selectedBus.capacity} Capacity`
                        : 'Capacity pending'
                    }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-4 border-stone-100 p-6 md:border-l">
              <p class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                Captain
              </p>
              <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-full bg-sky-700/10">
                  <UIcon name="i-heroicons-user" class="size-6 text-sky-700" />
                </div>
                <div>
                  <p class="text-sm leading-5 font-bold text-zinc-900">
                    {{ selectedDriver?.name || 'No driver selected' }}
                  </p>
                  <p class="text-xs leading-4 font-medium text-gray-700">
                    {{ selectedDriver?.detail || 'Driver details pending' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="currentStep === 'schedule'" class="flex flex-col gap-6">
          <div>
            <h3 class="text-lg leading-7 font-bold text-zinc-900">Schedule</h3>
            <p class="text-sm text-gray-700">Set the departure and estimated arrival time.</p>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <BaseInput
              v-model="form.departureTime"
              type="datetime-local"
              label="Departure"
              :disabled="optionsLoading || creating"
              :error="errors.departureTime"
              required
            />
            <BaseInput
              v-model="form.arrivalTime"
              type="datetime-local"
              label="Estimated Arrival"
              :disabled="optionsLoading || creating"
              :error="errors.arrivalTime"
              required
            />
          </div>

          <div
            class="inline-flex w-fit items-center gap-2 rounded-full bg-sky-700/5 px-3 py-1 text-xs leading-4 font-bold text-sky-700"
          >
            <UIcon name="i-heroicons-clock" class="size-4" />
            {{ durationLabel }}
          </div>
        </section>

        <section v-else class="flex flex-col gap-6">
          <BaseEmptyState
            v-if="submitError"
            :title="submitError"
            tone="danger"
            role="alert"
            class="text-left"
            data-testid="submit-error"
          />
          <div class="flex items-center justify-between gap-4">
            <h3 class="text-lg leading-7 font-bold text-zinc-900">Final Review</h3>
            <span
              class="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] leading-4 font-bold tracking-wide text-emerald-800 uppercase outline outline-1 outline-offset-[-1px] outline-emerald-500/20"
            >
              Scheduled
            </span>
          </div>

          <section
            class="overflow-hidden rounded-[32px] bg-white shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10"
          >
            <div
              class="flex items-center justify-between gap-4 border-b border-stone-100 bg-gradient-to-r from-slate-50 to-white px-6 py-8 md:px-8"
            >
              <div class="min-w-0 flex-1">
                <p class="text-[10px] leading-4 tracking-wide text-sky-700 uppercase">Departure</p>
                <p class="truncate text-2xl leading-8 text-zinc-900">
                  {{ selectedRoute?.origin || 'Departure pending' }}
                </p>
              </div>
              <div class="flex w-20 shrink-0 flex-col items-center gap-1">
                <UIcon name="i-heroicons-arrow-long-right" class="size-8 text-sky-700" />
                <span class="text-[10px] leading-4 font-bold text-gray-700">
                  {{ selectedRoute?.distance ? `${selectedRoute.distance} km` : '-- km' }}
                </span>
              </div>
              <div class="min-w-0 flex-1 text-right">
                <p class="text-[10px] leading-4 font-bold tracking-wide text-violet-700 uppercase">
                  Destination
                </p>
                <p class="truncate text-2xl leading-8 font-black text-zinc-900">
                  {{ selectedRoute?.destination || 'Destination pending' }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3">
              <div class="flex flex-col gap-4 p-6">
                <p class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                  Fleet Resource
                </p>
                <div class="flex items-center gap-4">
                  <div class="flex size-12 items-center justify-center rounded-[32px] bg-stone-200">
                    <UIcon name="i-heroicons-truck" class="size-6 text-zinc-900" />
                  </div>
                  <div>
                    <p class="text-sm leading-5 font-bold text-zinc-900">
                      {{ selectedBus?.label || 'No bus selected' }}
                    </p>
                    <p class="text-xs leading-4 font-medium text-gray-700">
                      {{ selectedBus?.capacity ? `${selectedBus.capacity} Capacity` : 'Pending' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-4 border-stone-100 p-6 md:border-l">
                <p class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                  Captain
                </p>
                <div class="flex items-center gap-4">
                  <div class="flex size-12 items-center justify-center rounded-full bg-sky-700/10">
                    <UIcon name="i-heroicons-user" class="size-6 text-sky-700" />
                  </div>
                  <div>
                    <p class="text-sm leading-5 font-bold text-zinc-900">
                      {{ selectedDriver?.name || 'No driver selected' }}
                    </p>
                    <p class="text-xs leading-4 font-medium text-gray-700">
                      {{ selectedDriver?.detail || 'Driver details pending' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-4 border-stone-100 p-6 md:border-l">
                <p class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                  Timing
                </p>
                <dl class="flex flex-col gap-2">
                  <div class="flex justify-between gap-4">
                    <dt class="text-xs text-gray-700">Departure</dt>
                    <dd class="text-sm font-bold text-zinc-900">
                      {{ form.departureTime || 'Pending' }}
                    </dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-xs text-gray-700">Arrival</dt>
                    <dd class="text-sm font-bold text-zinc-900">
                      {{ form.arrivalTime || 'Pending' }}
                    </dd>
                  </div>
                </dl>
                <div
                  class="inline-flex w-fit items-center gap-2 rounded-full bg-sky-700/5 px-3 py-1 text-xs leading-4 font-bold text-sky-700"
                >
                  <UIcon name="i-heroicons-clock" class="size-4" />
                  {{ durationLabel }}
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>

      <footer
        class="flex flex-col gap-3 bg-stone-100/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8"
      >
        <BaseButton
          v-if="currentStepIndex > 0"
          type="secondary"
          html-type="button"
          :disabled="!canNavigate"
          @click="goBack"
        >
          Back to {{ WIZARD_STEPS[currentStepIndex - 1].label }}
        </BaseButton>
        <span v-else></span>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton type="secondary" html-type="button" :disabled="creating" @click="closeModal">
            Cancel
          </BaseButton>
          <BaseButton
            v-if="!isReviewStep"
            html-type="button"
            :disabled="!canNavigate"
            @click="goNext"
          >
            Next
          </BaseButton>
          <BaseButton v-else html-type="submit" :loading="creating" :disabled="!canNavigate">
            {{ isEdit ? 'Save Changes' : 'Schedule Trip' }}
            <template #icon-right>
              <UIcon name="i-heroicons-check" class="size-4" />
            </template>
          </BaseButton>
        </div>
      </footer>
    </form>
  </BaseModal>
</template>
