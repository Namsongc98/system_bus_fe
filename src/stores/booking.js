import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ticketService } from '@/services/ticketService'
import { paymentService } from '@/services/paymentService'

const MOCK_TICKETS = [
  {
    id: 'FV-92044',
    status: 'UPCOMING',
    from: 'San Francisco',
    to: 'Los Angeles',
    departureTime: '2026-06-10T08:00:00',
    arrivalTime: '2026-06-10T14:30:00',
    seatNumber: '12A',
    seatType: 'Window',
    price: 450000,
    qrCodeUrl: 'https://placehold.co/80x80',
  },
  {
    id: 'FV-88121',
    status: 'BOARDED',
    from: 'Seattle',
    to: 'Portland',
    departureTime: '2026-04-19T10:15:00',
    arrivalTime: '2026-04-19T13:45:00',
    seatNumber: '04C',
    seatType: 'Aisle',
    price: 320000,
    qrCodeUrl: 'https://placehold.co/80x80',
  },
  {
    id: 'FV-77290',
    status: 'CANCELLED',
    from: 'Austin',
    to: 'Houston',
    departureTime: '2026-05-25T17:00:00',
    arrivalTime: '2026-05-25T20:15:00',
    seatNumber: '--',
    totalPrice: 280000,
    refundStatus: 'PROCESSED',
    qrCodeUrl: 'https://placehold.co/80x80',
  },
]

export const useBookingStore = defineStore('booking', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const currentTicket = ref(null)
  const myTickets = ref([...MOCK_TICKETS])
  const qrCode = ref(null)
  const payment = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function bookTicket(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await ticketService.book(payload)
      const ticket = response?.data?.data ?? response?.data ?? response
      currentTicket.value = ticket
      return ticket
    } catch (err) {
      error.value = err?.message || 'Unable to book ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyTickets(params) {
    loading.value = true
    error.value = null
    try {
      const response = await ticketService.getMyTickets(params)
      const data = response?.data?.data ?? response?.data ?? response
      const tickets = Array.isArray(data) ? data : data?.content || []
      myTickets.value = tickets.length > 0 ? tickets : [...MOCK_TICKETS]
      return myTickets.value
    } catch (err) {
      error.value = null
      myTickets.value = [...MOCK_TICKETS]
      return myTickets.value
    } finally {
      loading.value = false
    }
  }

  async function fetchQRCode(ticketId) {
    loading.value = true
    error.value = null
    try {
      const response = await paymentService.getQRCode(ticketId)
      qrCode.value = response?.data?.data ?? response?.data ?? response
      return qrCode.value
    } catch (err) {
      error.value = err?.message || 'Unable to load payment QR code'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmPayment(paymentId) {
    loading.value = true
    error.value = null
    try {
      const response = await paymentService.confirmPayment(paymentId)
      payment.value = response?.data?.data ?? response?.data ?? response
      return payment.value
    } catch (err) {
      error.value = err?.message || 'Unable to confirm payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelTicket(ticketId) {
    loading.value = true
    error.value = null
    try {
      const response = await ticketService.cancel(ticketId)
      await fetchMyTickets()
      return response?.data?.data ?? response?.data ?? response
    } catch (err) {
      error.value = err?.message || 'Unable to cancel ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetBooking() {
    currentTicket.value = null
    qrCode.value = null
    payment.value = null
  }

  return {
    currentTicket,
    myTickets,
    qrCode,
    payment,
    loading,
    error,
    bookTicket,
    fetchMyTickets,
    fetchQRCode,
    confirmPayment,
    cancelTicket,
    resetBooking,
  }
})
