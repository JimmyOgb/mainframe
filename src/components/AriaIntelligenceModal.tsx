import React, { useState, useEffect } from 'react'
import { nansen } from '../api/nansen.ts'
import {
  NansenNetflowItem,
  NansenPerpTradeItem,
  NansenDCAItem,
  NansenDexTradeItem,
} from '../api/types.ts'

interface AriaIntelligenceModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'netflows' | 'perps' | 'dcas' | 'dex'
}

export const AriaIntelligenceModal: React.FC<AriaIntelligenceModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'netflows',
}) => {
  const [apiKey, setApiKey] = useState(nansen.getApiKey())
  const [tempKey, setTempKey] = useState(apiKey)
  const [isEditingKey, setIsEditingKey] = useState(!nansen.hasApiKey())
  const [activeTab, setActiveTab] = useState<'netflows' | 'perps' | 'dcas' | 'dex'>(initialTab)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined)

  // Real live data states (zero mock)
  const [netflows, setNetflows] = useState<NansenNetflowItem[]>([])
  const [perpTrades, setPerpTrades] = useState<NansenPerpTradeItem[]>([])
  const [dcas, setDcas] = useState<NansenDCAItem[]>([])
  const [dexTrades, setDexTrades] = useState<NansenDexTradeItem[]>([])

  const fetchLiveFeed = async (tab: 'netflows' | 'perps' | 'dcas' | 'dex') => {
    if (!nansen.hasApiKey()) {
      setErrorMessage('Nansen API Key is required. Please enter your live key below to query live on-chain intelligence.')
      setIsEditingKey(true)
      return
    }

    setLoading(true)
    setErrorMessage(null)
    setStatusCode(undefined)

    try {
      if (tab === 'netflows') {
        const res = await nansen.getSmartMoneyNetflows()
        if (res.success && res.data) {
          setNetflows(res.data)
        } else {
          setErrorMessage(res.error || 'Failed to fetch live netflows')
          setStatusCode(res.statusCode)
        }
      } else if (tab === 'perps') {
        const res = await nansen.getSmartMoneyPerpTrades()
        if (res.success && res.data) {
          setPerpTrades(res.data)
        } else {
          setErrorMessage(res.error || 'Failed to fetch live Hyperliquid perp trades')
          setStatusCode(res.statusCode)
        }
      } else if (tab === 'dcas') {
        const res = await nansen.getSmartMoneyDCAs()
        if (res.success && res.data) {
          setDcas(res.data)
        } else {
          setErrorMessage(res.error || 'Failed to fetch live Jupiter Solana DCAs')
          setStatusCode(res.statusCode)
        }
      } else if (tab === 'dex') {
        const res = await nansen.getSmartMoneyDexTrades()
        if (res.success && res.data) {
          setDexTrades(res.data)
        } else {
          setErrorMessage(res.error || 'Failed to fetch live Smart Money DEX trades')
          setStatusCode(res.statusCode)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (!nansen.hasApiKey()) {
        setIsEditingKey(true)
      } else {
        fetchLiveFeed(activeTab)
      }
    }
  }, [isOpen, activeTab])

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempKey.trim()) return
    nansen.setApiKey(tempKey.trim())
    setApiKey(tempKey.trim())
    setIsEditingKey(false)
    setErrorMessage(null)
    fetchLiveFeed(activeTab)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white text-black rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-black/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-neutral-50/90">
          <div className="flex items-center gap-3">
            <span
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Nansen On-Chain Live Feed
            </span>
            <span className="text-[11px] px-2.5 py-0.5 bg-black text-white rounded-full font-mono uppercase tracking-wider">
              {nansen.hasApiKey() ? 'Live Stream Active' : 'Key Required'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingKey((prev) => !prev)}
              className="text-xs px-3 py-1.5 border border-black/20 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer font-mono"
            >
              {nansen.hasApiKey() ? 'Configured ⚙' : 'Enter API Key'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-black/20 hover:bg-black hover:text-white transition-colors cursor-pointer text-base leading-none"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* API Key Drawer */}
        {isEditingKey && (
          <form
            onSubmit={handleSaveKey}
            className="p-4 bg-neutral-100 border-b border-black/10 flex flex-col sm:flex-row gap-3 items-center"
          >
            <div className="flex-1 w-full">
              <input
                type="password"
                placeholder="Enter Nansen API Key (from app.nansen.ai/api)"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-black/20 rounded-lg focus:outline-none focus:border-black font-mono"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors font-mono cursor-pointer font-semibold"
              >
                Connect Live API
              </button>
              {nansen.hasApiKey() && (
                <button
                  type="button"
                  onClick={() => {
                    nansen.setApiKey('')
                    setApiKey('')
                    setTempKey('')
                    setIsEditingKey(true)
                  }}
                  className="px-3 py-2 text-xs border border-black/20 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer font-mono"
                >
                  Clear Key
                </button>
              )}
            </div>
          </form>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-neutral-50 border-b border-black/10 overflow-x-auto text-xs font-mono">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500">
            Live Feeds:
          </span>
          <button
            onClick={() => setActiveTab('netflows')}
            className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
              activeTab === 'netflows'
                ? 'bg-black text-white'
                : 'text-neutral-600 hover:text-black bg-white border border-black/10'
            }`}
          >
            Smart Money Netflows
          </button>
          <button
            onClick={() => setActiveTab('perps')}
            className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
              activeTab === 'perps'
                ? 'bg-black text-white'
                : 'text-neutral-600 hover:text-black bg-white border border-black/10'
            }`}
          >
            Hyperliquid Perp Trades
          </button>
          <button
            onClick={() => setActiveTab('dcas')}
            className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
              activeTab === 'dcas'
                ? 'bg-black text-white'
                : 'text-neutral-600 hover:text-black bg-white border border-black/10'
            }`}
          >
            Jupiter Solana DCAs
          </button>
          <button
            onClick={() => setActiveTab('dex')}
            className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
              activeTab === 'dex'
                ? 'bg-black text-white'
                : 'text-neutral-600 hover:text-black bg-white border border-black/10'
            }`}
          >
            DEX Trades
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Live Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-mono space-y-2">
              <div className="font-bold flex items-center gap-2">
                <span>⚠</span> Live Nansen API Notice {statusCode ? `[HTTP ${statusCode}]` : ''}
              </div>
              <p>{errorMessage}</p>
              {!nansen.hasApiKey() && (
                <div className="pt-2">
                  <a
                    href="https://app.nansen.ai/api"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-3 py-1 bg-rose-700 text-white rounded text-xs hover:bg-rose-800 transition-colors"
                  >
                    Generate Nansen API Key ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span className="text-xs sm:text-sm font-mono text-neutral-500">
                Calling live Nansen API endpoint (https://api.nansen.ai/v1)...
              </span>
            </div>
          ) : (
            <>
              {/* Netflows Table */}
              {activeTab === 'netflows' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                    <span>Endpoint: <code>POST /v1/smart-money/netflows</code></span>
                    <span>Count: {netflows.length} tokens</span>
                  </div>
                  {netflows.length === 0 && !errorMessage ? (
                    <div className="p-8 text-center text-neutral-400 font-mono text-xs">
                      No live netflow items returned or waiting for query.
                    </div>
                  ) : (
                    <div className="border border-black/10 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-100 text-neutral-600 font-mono text-xs">
                          <tr>
                            <th className="p-3">Asset</th>
                            <th className="p-3">Chain</th>
                            <th className="p-3">24h Netflow (USD)</th>
                            <th className="p-3">Inflow / Outflow</th>
                            <th className="p-3">Buyers / Sellers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 font-mono text-xs">
                          {netflows.map((item, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="p-3 font-semibold text-black">${item.token_symbol || 'N/A'}</td>
                              <td className="p-3 uppercase text-neutral-500">{item.chain || 'ethereum'}</td>
                              <td
                                className={`p-3 font-semibold ${
                                  (item.netflow_usd || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {(item.netflow_usd || 0) >= 0 ? '+' : ''}$
                                {Number(item.netflow_usd || 0).toLocaleString()}
                              </td>
                              <td className="p-3 text-neutral-600">
                                ${(item.inflow_usd || 0).toLocaleString()} / ${(item.outflow_usd || 0).toLocaleString()}
                              </td>
                              <td className="p-3 text-neutral-600">
                                {item.smart_money_buyers || 0} / {item.smart_money_sellers || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Hyperliquid Perps Table */}
              {activeTab === 'perps' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                    <span>Endpoint: <code>POST /v1/smart-money/perp-trades</code></span>
                    <span>Count: {perpTrades.length} trades</span>
                  </div>
                  {perpTrades.length === 0 && !errorMessage ? (
                    <div className="p-8 text-center text-neutral-400 font-mono text-xs">
                      No live perp trades returned.
                    </div>
                  ) : (
                    <div className="border border-black/10 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-100 text-neutral-600 font-mono text-xs">
                          <tr>
                            <th className="p-3">Trader</th>
                            <th className="p-3">Market</th>
                            <th className="p-3">Side</th>
                            <th className="p-3">Size (USD)</th>
                            <th className="p-3">Leverage</th>
                            <th className="p-3">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 font-mono text-xs">
                          {perpTrades.map((t, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="p-3 text-neutral-700">{t.trader_label || t.trader_address || 'Smart Trader'}</td>
                              <td className="p-3 font-semibold text-black">{t.market || 'ETH-PERP'}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold ${
                                    t.side === 'LONG'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {t.side || 'LONG'}
                                </span>
                              </td>
                              <td className="p-3 font-semibold">${Number(t.size_usd || 0).toLocaleString()}</td>
                              <td className="p-3">{t.leverage || 1}x</td>
                              <td className="p-3">${Number(t.entry_price || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Solana DCAs Table */}
              {activeTab === 'dcas' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                    <span>Endpoint: <code>POST /v1/smart-money/dcas</code></span>
                    <span>Count: {dcas.length} DCAs</span>
                  </div>
                  {dcas.length === 0 && !errorMessage ? (
                    <div className="p-8 text-center text-neutral-400 font-mono text-xs">
                      No live DCA orders returned.
                    </div>
                  ) : (
                    <div className="border border-black/10 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-100 text-neutral-600 font-mono text-xs">
                          <tr>
                            <th className="p-3">Wallet</th>
                            <th className="p-3">Pair</th>
                            <th className="p-3">Total Budget</th>
                            <th className="p-3">Cycles</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 font-mono text-xs">
                          {dcas.map((d, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="p-3 text-neutral-700">{d.wallet_label || d.wallet_address || 'Smart DCA'}</td>
                              <td className="p-3 font-semibold text-black">{d.input_token || 'USDC'} → {d.output_token || 'SOL'}</td>
                              <td className="p-3 font-semibold">${Number(d.total_budget_usd || 0).toLocaleString()}</td>
                              <td className="p-3">{d.executed_cycles || 0} cycles</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-bold uppercase">
                                  {d.status || 'ACTIVE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* DEX Trades Table */}
              {activeTab === 'dex' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                    <span>Endpoint: <code>POST /v1/smart-money/dex-trades</code></span>
                    <span>Count: {dexTrades.length} trades</span>
                  </div>
                  {dexTrades.length === 0 && !errorMessage ? (
                    <div className="p-8 text-center text-neutral-400 font-mono text-xs">
                      No live DEX trades returned.
                    </div>
                  ) : (
                    <div className="border border-black/10 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-100 text-neutral-600 font-mono text-xs">
                          <tr>
                            <th className="p-3">Token</th>
                            <th className="p-3">Trader</th>
                            <th className="p-3">Side</th>
                            <th className="p-3">Volume (USD)</th>
                            <th className="p-3">Chain</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 font-mono text-xs">
                          {dexTrades.map((trade, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="p-3 font-semibold text-black">${trade.token_symbol || 'TOKEN'}</td>
                              <td className="p-3 text-neutral-700">{trade.trader_address || 'Address'}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold ${
                                    trade.side === 'BUY'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {trade.side || 'BUY'}
                                </span>
                              </td>
                              <td className="p-3 font-semibold">${Number(trade.volume_usd || 0).toLocaleString()}</td>
                              <td className="p-3 uppercase text-neutral-500">{trade.chain || 'ethereum'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-100 border-t border-black/10 text-xs text-neutral-500 flex justify-between items-center">
          <span className="font-mono">
            Zero-Mock Nansen API Stream • Direct Endpoint Integration
          </span>
          <button
            onClick={() => fetchLiveFeed(activeTab)}
            className="font-mono underline hover:text-black cursor-pointer"
          >
            ↻ Refresh Live Endpoint
          </button>
        </div>
      </div>
    </div>
  )
}
