'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Zap, Shield, Brain } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import AnalysisResult from '../components/AnalysisResult'
import LoadingSpinner from '../components/LoadingSpinner'

interface AnalysisData {
  PAIR: string
  TIMEFRAME: string
  TREND: string
  SIGNAL: string
}

type AppState = 'upload' | 'loading' | 'result' | 'error'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload')
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleFileSelect = async (file: File) => {
    setAppState('loading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze chart')
      }

      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis)
        setAppState('result')
      } else {
        throw new Error('Invalid response from analysis service')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
      setAppState('error')
    }
  }

  const handleNewAnalysis = () => {
    setAppState('upload')
    setAnalysisResult(null)
    setErrorMessage('')
  }

  const handleRetry = () => {
    setAppState('upload')
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <div className="flex items-center justify-center space-x-3">
                <BarChart3 size={40} className="text-trading-green" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Trading Chart Analyzer
                </h1>
              </div>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                AI-powered analysis of trading charts with instant pair detection, trend analysis, and trading signals
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              <div className="glassmorphism rounded-xl p-4 text-center">
                <Brain size={24} className="text-trading-blue mx-auto mb-2" />
                <h3 className="font-semibold text-white text-sm">AI Analysis</h3>
                <p className="text-white/60 text-xs">Advanced pattern recognition</p>
              </div>
              <div className="glassmorphism rounded-xl p-4 text-center">
                <Zap size={24} className="text-trading-green mx-auto mb-2" />
                <h3 className="font-semibold text-white text-sm">Instant Results</h3>
                <p className="text-white/60 text-xs">Real-time processing</p>
              </div>
              <div className="glassmorphism rounded-xl p-4 text-center">
                <Shield size={24} className="text-trading-red mx-auto mb-2" />
                <h3 className="font-semibold text-white text-sm">Secure</h3>
                <p className="text-white/60 text-xs">Server-side processing</p>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              {appState === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FileUpload onFileSelect={handleFileSelect} />
                </motion.div>
              )}

              {appState === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoadingSpinner />
                </motion.div>
              )}

              {appState === 'result' && analysisResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnalysisResult 
                    analysis={analysisResult} 
                    onNewAnalysis={handleNewAnalysis} 
                  />
                </motion.div>
              )}

              {appState === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md mx-auto text-center space-y-6"
                >
                  <div className="glassmorphism-strong rounded-2xl p-8">
                    <div className="text-trading-red mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Analysis Failed
                    </h3>
                    <p className="text-white/70 text-sm mb-6">
                      {errorMessage}
                    </p>
                    <button
                      onClick={handleRetry}
                      className="bg-gradient-to-r from-trading-green to-trading-blue hover:from-trading-blue hover:to-trading-green text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/50 text-sm">
              © 2024 Trading Chart Analyzer. Built with Next.js, OpenAI, and Tailwind CSS.
            </p>
            <p className="text-white/30 text-xs mt-2">
              This tool is for educational purposes only. Always do your own research before making trading decisions.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}