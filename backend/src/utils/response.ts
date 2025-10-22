import { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Success response helpers
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response<ApiResponse<T>> => {
  return successResponse(res, data, message, 201);
};

export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

// Error response helpers
export const errorResponse = (
  res: Response,
  error: string,
  message: string = 'An error occurred',
  statusCode: number = 500
): Response<ApiResponse<never>> => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};

export const badRequestResponse = (
  res: Response,
  error: string,
  message: string = 'Bad request'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, message, 400);
};

export const unauthorizedResponse = (
  res: Response,
  error: string = 'Unauthorized',
  message: string = 'Authentication required'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, message, 401);
};

export const forbiddenResponse = (
  res: Response,
  error: string = 'Forbidden',
  message: string = 'Access denied'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, message, 403);
};

export const notFoundResponse = (
  res: Response,
  error: string = 'Not found',
  message: string = 'Resource not found'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, message, 404);
};

export const conflictResponse = (
  res: Response,
  error: string = 'Conflict',
  message: string = 'Resource already exists'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, message, 409);
};

export const validationErrorResponse = (
  res: Response,
  error: string,
  message: string = 'Validation failed'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, message, 422);
};

export const tooManyRequestsResponse = (
  res: Response,
  error: string = 'Too many requests',
  message: string = 'Rate limit exceeded'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, message, 429);
};

// Pagination response helper
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = 'Success'
): Response<PaginatedResponse<T>> => {
  return res.status(200).json({
    data,
    pagination,
    message,
  });
};

// Validation error response helper
export const validationErrorsResponse = (
  res: Response,
  errors: Record<string, string[]>
): Response<ApiResponse<never>> => {
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    message: 'Please check your input',
    validationErrors: errors,
  });
};

// Database error response helper
export const databaseErrorResponse = (
  res: Response,
  error: Error
): Response<ApiResponse<never>> => {
  console.error('Database error:', error);
  return errorResponse(
    res,
    'Database error',
    'An error occurred while accessing the database',
    500
  );
};

// Authentication error response helper
export const authErrorResponse = (
  res: Response,
  error: string = 'Authentication failed'
): Response<ApiResponse<never>> => {
  return unauthorizedResponse(res, error, 'Invalid credentials');
};

// File upload error response helper
export const fileUploadErrorResponse = (
  res: Response,
  error: string = 'File upload failed'
): Response<ApiResponse<never>> => {
  return errorResponse(res, error, 'Error uploading file', 400);
};

// AI service error response helper
export const aiServiceErrorResponse = (
  res: Response,
  error: string = 'AI service error'
): Response<ApiResponse<never>> => {
  return errorResponse(
    res,
    error,
    'An error occurred with the AI service',
    503
  );
};

// Generic send response (alias for successResponse)
export const sendResponse = successResponse;
