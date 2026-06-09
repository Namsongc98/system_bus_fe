export const SEAT_VIEW_BOOKED_SEAT_NUMBERS = [1, 4, 7, 10, 21, 31]

export const SEAT_VIEW_FAKE_SEATS = Array.from({ length: 41 }, (_, index) => {
  const number = index + 1
  const booked = SEAT_VIEW_BOOKED_SEAT_NUMBERS.includes(number)

  return {
    id: number,
    number,
    status: booked ? 'booked' : 'available',
  }
})
