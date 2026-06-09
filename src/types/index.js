/**
 * @typedef {Object} User
 * @property {number}           id
 * @property {string}           name
 * @property {string}           email
 * @property {string}           phone
 * @property {'admin'|'user'}   role
 * @property {string}           createdAt
 */

/**
 * @typedef {Object} Trip
 * @property {number} id
 * @property {string} origin
 * @property {string} destination
 * @property {string} departureTime
 * @property {string} arrivalTime
 * @property {number} price
 * @property {number} availableSeats
 * @property {string} status
 */

/**
 * @typedef {Object} Seat
 * @property {number}                          id
 * @property {string}                          seatNumber
 * @property {'available'|'reserved'|'sold'}   status
 * @property {number}                          tripId
 */

/**
 * @typedef {Object} Ticket
 * @property {number}                              id
 * @property {number}                              userId
 * @property {number}                              tripId
 * @property {number}                              seatId
 * @property {string}                              bookingCode
 * @property {'pending'|'confirmed'|'cancelled'}   status
 * @property {number}                              totalAmount
 * @property {string}                              createdAt
 */

/**
 * @typedef {Object} Payment
 * @property {number}                        id
 * @property {number}                        ticketId
 * @property {string}                        qrCode
 * @property {'pending'|'success'|'failed'}  status
 * @property {string}                        paidAt
 */

/**
 * @typedef {Object} Bus
 * @property {number} id
 * @property {string} plateNumber
 * @property {string} model
 * @property {number} capacity
 */

/**
 * @typedef {Object} Route
 * @property {number} id
 * @property {string} origin
 * @property {string} destination
 * @property {number} distanceKm
 * @property {number} durationMin
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {T}       data
 * @property {string}  message
 * @property {number}  statusCode
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {T[]}   content
 * @property {number} page
 * @property {number} size
 * @property {number} totalElements
 * @property {number} totalPages
 */
