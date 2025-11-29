// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// API Error
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Success Response
export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

// Error Response
export interface ErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
}

// API Response Union
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

// Pagination params
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// File upload response
export interface FileUploadResponse {
  url: string
  path: string
  size: number
  type: string
}
