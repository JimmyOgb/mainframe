// Pure Live Nansen API Types (Zero-Mock)

export interface NansenNetflowItem {
  token_address?: string
  token_symbol?: string
  chain?: string
  netflow_usd?: number
  inflow_usd?: number
  outflow_usd?: number
  smart_money_buyers?: number
  smart_money_sellers?: number
  price_usd?: number
  [key: string]: any
}

export interface NansenPerpTradeItem {
  trader_address?: string
  trader_label?: string
  market?: string
  side?: string
  size_usd?: number
  entry_price?: number
  leverage?: number
  timestamp?: string
  [key: string]: any
}

export interface NansenDCAItem {
  wallet_address?: string
  wallet_label?: string
  input_token?: string
  output_token?: string
  total_budget_usd?: number
  frequency_hours?: number
  executed_cycles?: number
  remaining_cycles?: number
  status?: string
  [key: string]: any
}

export interface NansenDexTradeItem {
  token_symbol?: string
  token_address?: string
  trader_address?: string
  side?: string
  volume_usd?: number
  price_usd?: number
  timestamp?: string
  chain?: string
  [key: string]: any
}

export interface NansenApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}
