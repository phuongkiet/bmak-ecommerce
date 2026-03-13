import { apiClient, ApiResponse } from './apiClient'
import type { ProductReportDto, ReportFilterParams, RevenueReportDto } from '@/models/Report'

const buildReportQueryString = (params: ReportFilterParams): string => {
  const queryParams = new URLSearchParams()

  if (params.fromDate) queryParams.append('fromDate', params.fromDate)
  if (params.toDate) queryParams.append('toDate', params.toDate)
  if (typeof params.top === 'number') queryParams.append('top', String(params.top))

  return queryParams.toString()
}

const unwrapResponse = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'isSuccess' in (response as ApiResponse<T>)) {
    return ((response as ApiResponse<T>).value ?? {}) as T
  }

  return response as T
}

export const getRevenueReport = async (
  params: ReportFilterParams = {}
): Promise<RevenueReportDto> => {
  const queryString = buildReportQueryString(params)
  const endpoint = `/admin/reports/revenue${queryString ? `?${queryString}` : ''}`
  const response = await apiClient.get<ApiResponse<RevenueReportDto> | RevenueReportDto>(endpoint)
  return unwrapResponse(response)
}

export const getProductReport = async (
  params: ReportFilterParams = {}
): Promise<ProductReportDto> => {
  const queryString = buildReportQueryString(params)
  const endpoint = `/admin/reports/products${queryString ? `?${queryString}` : ''}`
  const response = await apiClient.get<ApiResponse<ProductReportDto> | ProductReportDto>(endpoint)
  return unwrapResponse(response)
}