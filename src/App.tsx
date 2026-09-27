import React, { useState, useEffect, useRef } from 'react'
import { useTypewriter } from './useTypewriter.ts'
import { AriaIntelligenceModal } from './components/AriaIntelligenceModal.tsx'
import { nansen } from './api/nansen.ts'

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pillsVisible, setPillsVisible] = useState(false)
  const [isAriaModalOpen, setIsAriaModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'netflows' | 'perps' | 'dcas' | 'dex'>('netflows')
  const [heroSearchInput, setHeroSearchInput] = useState('')

  // Typewriter hook - focused 100% on the Nansen Meridian project
  const { displayed, done } = useTypewriter(
    'Streaming live smart money netflows, Hyperliquid perps, and Jupiter DCAs directly from Nansen.',
    { speed: 32, startDelay: 400 }
  )

  // Action pills visibility (400ms after mount, independent of typewriter)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  // Video mouse scrubbing controller
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const targetTimeRef = useRef<number>(0)
  const isSeekingRef = useRef<boolean>(false)
  const prevXRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      targetTimeRef.current = video.currentTime || 0
    }

    const handleSeeked = () => {
      isSeekingRef.current = false
      if (!video) return
      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.02) {
        isSeekingRef.current = true
        video.currentTime = targetTimeRef.current
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX
        return
      }

      const delta = e.clientX - prevXRef.current
      prevXRef.current = e.clientX

      if (!video || !video.duration || Number.isNaN(video.duration)) return

      const SENSITIVITY = 0.8
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration
      const newTargetTime = Math.max(0, Math.min(video.duration, targetTimeRef.current + timeOffset))
      targetTimeRef.current = newTargetTime

      if (!isSeekingRef.current) {
        isSeekingRef.current = true
        video.currentTime = newTargetTime
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('seeked', handleSeeked)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('seeked', handleSeeked)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const openLiveFeed = (tab: 'netflows' | 'perps' | 'dcas' | 'dex') => {
    setModalTab(tab)
    setIsAriaModalOpen(true)
  }

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    openLiveFeed('netflows')
  }

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      {/* Background Video (mouse scrubbed) */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 z-0 object-cover w-full h-full pointer-events-none"
        style={{ objectPosition: '70% center' }}
      />

      {/* Navbar (fixed, z-index: 10) */}
      <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between w-full px-5 sm:px-8 py-4 sm:py-5">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-black cursor-pointer"
            style={{ fontFamily: 'var(--font-heading)' }}
            onClick={() => openLiveFeed('netflows')}
          >
            A.R.I.A®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-black select-none leading-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono text-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Nansen Meridian Live
          </span>
        </div>

        {/* Desktop Nav Links (center) */}
        <div className="hidden md:flex items-center text-[19px] lg:text-[21px] text-black">
          <button
            onClick={() => openLiveFeed('netflows')}
            className="hover:opacity-60 transition-opacity cursor-pointer font-medium"
          >
            Smart Netflows
          </button>
          <span>,&nbsp;</span>
          <button
            onClick={() => openLiveFeed('perps')}
            className="hover:opacity-60 transition-opacity cursor-pointer font-medium"
          >
            Hyperliquid Perps
          </button>
          <span>,&nbsp;</span>
          <button
            onClick={() => openLiveFeed('dcas')}
            className="hover:opacity-60 transition-opacity cursor-pointer font-medium"
          >
            Solana DCAs
          </button>
          <span>,&nbsp;</span>
          <button
            onClick={() => openLiveFeed('dex')}
            className="hover:opacity-60 transition-opacity cursor-pointer font-medium"
          >
            DEX Swaps
          </button>
        </div>

        {/* Desktop CTA (right) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => openLiveFeed('netflows')}
            className="text-[19px] lg:text-[21px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer font-medium"
          >
            Launch Terminal ↗
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] z-20 focus:outline-none cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile Overlay Menu */}
      <div
        className={`fixed inset-0 bg-white/95 backdrop-blur-sm z-[9] flex flex-col justify-center px-8 gap-8 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => {
            setMobileMenuOpen(false)
            openLiveFeed('netflows')
          }}
          className="text-left text-[28px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Smart Netflows
        </button>
        <button
          onClick={() => {
            setMobileMenuOpen(false)
            openLiveFeed('perps')
          }}
          className="text-left text-[28px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Hyperliquid Perps
        </button>
        <button
          onClick={() => {
            setMobileMenuOpen(false)
            openLiveFeed('dcas')
          }}
          className="text-left text-[28px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Solana DCAs
        </button>
        <button
          onClick={() => {
            setMobileMenuOpen(false)
            openLiveFeed('dex')
          }}
          className="text-left text-[28px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          DEX Swaps
        </button>
        <button
          onClick={() => {
            setMobileMenuOpen(false)
            openLiveFeed('netflows')
          }}
          className="text-left text-[28px] font-medium text-black underline underline-offset-4 hover:opacity-60 transition-opacity"
        >
          Launch Terminal ↗
        </button>
      </div>

      {/* Hero Section */}
      <main className="relative z-[1] w-full h-screen flex flex-col justify-end pb-10 sm:pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
        <div className="max-w-xl relative z-10">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-4 sm:mb-5 text-black"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              filter: 'blur(4px)',
            }}
          >
            Nansen Meridian Buildathon,
            <br />
            A.R.I.A Live On-Chain Intelligence Copilot
          </div>

          {/* 2. Typewriter text */}
          <p
            className="text-black mb-5 sm:mb-6 select-text font-normal"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              minHeight: '54px',
            }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
            )}
          </p>

          {/* Direct Live Nansen Search Input */}
          <form
            onSubmit={handleHeroSubmit}
            className="mb-4 flex items-center bg-white/95 backdrop-blur-md border border-black/15 rounded-full p-1.5 shadow-md max-w-lg transition-all focus-within:border-black focus-within:ring-2 focus-within:ring-black/10"
          >
            <input
              type="text"
              placeholder="Query live Nansen token flows, perps, or DCAs..."
              value={heroSearchInput}
              onChange={(e) => setHeroSearchInput(e.target.value)}
              className="flex-1 bg-transparent px-4 py-1 text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-mono font-medium hover:bg-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Stream Live ↗
            </button>
          </form>

          {/* 3. Action pill buttons - 100% focused on Nansen Meridian project */}
          <div
            className={`flex flex-wrap gap-y-1 transition-all duration-400 ease-out ${
              pillsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: '0.4s',
              transitionTimingFunction: 'ease',
            }}
          >
            <button
              onClick={() => openLiveFeed('netflows')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-sm font-medium"
            >
              Smart Money Netflows
            </button>
            <button
              onClick={() => openLiveFeed('perps')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-sm font-medium"
            >
              Hyperliquid Perp Trades
            </button>
            <button
              onClick={() => openLiveFeed('dcas')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-sm font-medium"
            >
              Solana Jupiter DCAs
            </button>
            <button
              onClick={() => openLiveFeed('dex')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-sm font-medium"
            >
              DEX Trades Stream
            </button>

            {/* Outline pill button: Configure Nansen API Key */}
            <button
              onClick={() => openLiveFeed('netflows')}
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer group shadow-sm font-medium"
              title="Configure live Nansen API Key"
            >
              <span>
                {nansen.hasApiKey() ? 'API Key: Connected ✓' : 'Connect Nansen API Key ⚙'}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3 flex-shrink-0"
              >
                <path d="M7 1L11 5L7 9" />
                <path d="M11 5H1" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Zero-Mock Live Nansen API Ticker (bottom) */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 px-4 py-2 bg-black/85 backdrop-blur-md border-t border-white/10 text-[10px] sm:text-[11px] font-mono text-neutral-300 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NANSEN API LIVE STREAM (ZERO-MOCK)
          </span>
          <span>• Base URL: <code className="text-white">api.nansen.ai/v1</code></span>
          <span>• Endpoints: <span className="text-neutral-400">/smart-money/netflows, /perp-trades, /dcas, /dex-trades</span></span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-neutral-400 whitespace-nowrap">
          <span>Status:</span>
          <span className="text-white font-semibold px-2 py-0.5 bg-white/10 rounded">
            {nansen.hasApiKey() ? 'API Key Connected' : 'Waiting for Key'}
          </span>
        </div>
      </footer>

      {/* A.R.I.A Zero-Mock Live Nansen Modal */}
      <AriaIntelligenceModal
        isOpen={isAriaModalOpen}
        onClose={() => setIsAriaModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  )
}
