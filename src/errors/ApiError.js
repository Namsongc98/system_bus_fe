export class ApiError extends Error {
  constructor(status = 500, message = 'Unexpected error') {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}
