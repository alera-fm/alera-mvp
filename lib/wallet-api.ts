// Client-side API functions for wallet functionality

export interface WalletSummary {
  total_earnings: number
  pending_earnings: number
  withdrawn: number
  last_payout_date: string | null
  earnings_by_platform: Array<{
    platform: string
    amount: number
  }>
}

export interface WalletHistory {
  monthly_data: Array<{
    month: string
    total_earnings: number
    transaction_count: number
  }>
  transactions: Array<{
    date: string
    type: string
    source: string
    amount: number
    status: string
    platform?: string
  }>
}

export interface WithdrawalRequest {
  artist_id: string
  amount_requested: number
  method: string
  account_details?: string
}

export interface PayoutMethod {
  artist_id: string
  method: string
  account_info: string
}

export async function uploadRevenueReport(file: File, artistId: string): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('artist_id', artistId)
  
  const response = await fetch('/api/upload-revenue-report', {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload revenue report')
  }
  
  return response.json()
}

export async function getWalletSummary(artistId: string, range: string = '30days'): Promise<WalletSummary> {
  const response = await fetch(`/api/wallet/summary?artist_id=${artistId}&range=${range}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch wallet summary')
  }
  
  return response.json()
}

export async function getWalletHistory(artistId: string): Promise<WalletHistory> {
  const response = await fetch(`/api/wallet/history?artist_id=${artistId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch wallet history')
  }
  
  return response.json()
}

export async function requestWithdrawal(request: WithdrawalRequest): Promise<any> {
  const response = await fetch('/api/wallet/request-withdrawal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to request withdrawal')
  }
  
  return response.json()
}

export async function getWithdrawals(artistId: string): Promise<any> {
  const response = await fetch(`/api/wallet/withdrawals?artist_id=${artistId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch withdrawals')
  }
  
  return response.json()
}

export async function savePayoutMethod(method: PayoutMethod): Promise<any> {
  const response = await fetch('/api/wallet/payout-method', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(method),
  })
  
  if (!response.ok) {
    throw new Error('Failed to save payout method')
  }
  
  return response.json()
}

export async function getPayoutMethod(artistId: string): Promise<any> {
  const response = await fetch(`/api/wallet/payout-method?artist_id=${artistId}`)
  
  if (response.status === 404) {
    return null // No payout method found, return null instead of throwing
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch payout method')
  }
  
  return response.json()
}
