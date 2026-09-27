import {
  NansenNetflowItem,
  NansenPerpTradeItem,
  NansenDCAItem,
  NansenDexTradeItem,
  NansenApiResponse,
} from './types.ts'

const STORAGE_KEY = 'nansen_api_key'
const BASE_URL = 'https://api.nansen.ai/v1'

export class NansenService {
  private static instance: NansenService

  public static getInstance(): NansenService {
    if (!NansenService.instance) {
      NansenService.instance = new NansenService()
    }
    return NansenService.instance
  }

  public getApiKey(): string {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      (import.meta as any).env?.VITE_NANSEN_API_KEY ||
      ''
    )
  }

  public setApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim())
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  public hasApiKey(): boolean {
    return Boolean(this.getApiKey().trim())
  }

  private getHeaders(): Record<string, string> {
    const key = this.getApiKey().trim()
    return {
      'Content-Type': 'application/json',
      'apiKey': key,
      'api-key': key,
    }
  }

  /**
   * Fetch Live Smart Money Netflows (Zero-Mock)
   */
  public async getSmartMoneyNetflows(params?: {
    timeframe?: string
    chain?: string
  }): Promise<NansenApiResponse<NansenNetflowItem[]>> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: 'Nansen API Key required. Enter your live key from app.nansen.ai/api to stream real on-chain netflows.',
        statusCode: 401,
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/smart-money/netflows`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          timeframe: params?.timeframe || '24h',
          chain: params?.chain || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `Nansen API Error (${res.status} ${res.statusText})`,
          statusCode: res.status,
        }
      }

      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      return {
        success: true,
        data: list,
        statusCode: res.status,
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Nansen API: ${err?.message || err}`,
      }
    }
  }

  /**
   * Fetch Live Hyperliquid Perpetual Trades by Smart Money (Zero-Mock)
   */
  public async getSmartMoneyPerpTrades(params?: {
    limit?: number
  }): Promise<NansenApiResponse<NansenPerpTradeItem[]>> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: 'Nansen API Key required. Enter your live key to query Hyperliquid smart money perp trades.',
        statusCode: 401,
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/smart-money/perp-trades`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          limit: params?.limit || 20,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `Nansen API Error (${res.status} ${res.statusText})`,
          statusCode: res.status,
        }
      }

      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      return {
        success: true,
        data: list,
        statusCode: res.status,
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Nansen API: ${err?.message || err}`,
      }
    }
  }

  /**
   * Fetch Live Jupiter Solana DCA Orders by Smart Money (Zero-Mock)
   */
  public async getSmartMoneyDCAs(params?: {
    chain?: string
  }): Promise<NansenApiResponse<NansenDCAItem[]>> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: 'Nansen API Key required. Enter your live key to query Jupiter Solana DCAs.',
        statusCode: 401,
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/smart-money/dcas`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chain: params?.chain || 'solana',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `Nansen API Error (${res.status} ${res.statusText})`,
          statusCode: res.status,
        }
      }

      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      return {
        success: true,
        data: list,
        statusCode: res.status,
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Nansen API: ${err?.message || err}`,
      }
    }
  }

  /**
   * Fetch Live Smart Money DEX Trades (Zero-Mock)
   */
  public async getSmartMoneyDexTrades(params?: {
    token_address?: string
    limit?: number
  }): Promise<NansenApiResponse<NansenDexTradeItem[]>> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: 'Nansen API Key required to stream live DEX trades.',
        statusCode: 401,
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/smart-money/dex-trades`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          token_address: params?.token_address,
          limit: params?.limit || 20,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `Nansen API Error (${res.status} ${res.statusText})`,
          statusCode: res.status,
        }
      }

      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      return {
        success: true,
        data: list,
        statusCode: res.status,
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Nansen API: ${err?.message || err}`,
      }
    }
  }

  /**
   * Fetch Live Token Flow Intelligence (TGM)
   */
  public async getTokenFlowIntelligence(
    token_address: string,
    chain = 'ethereum'
  ): Promise<NansenApiResponse<any>> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: 'Nansen API Key required for Token Flow Intelligence.',
        statusCode: 401,
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/tgm/flow-intelligence`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          token_address,
          chain,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return {
          success: false,
          error: data?.message || data?.error || `Nansen API Error (${res.status} ${res.statusText})`,
          statusCode: res.status,
        }
      }

      return {
        success: true,
        data: data?.data || data,
        statusCode: res.status,
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Nansen API: ${err?.message || err}`,
      }
    }
  }
}

export const nansen = NansenService.getInstance()
