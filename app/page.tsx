'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Zap, Shield, Brain, Sparkles, TrendingUp, Eye, Cpu, AlertCircle } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import AnalysisResult from '../components/AnalysisResult'
import LoadingSpinner from '../components/LoadingSpinner'

interface AnalysisData {
  PAIR: string
  TIMEFRAME: string
  TREND: string
  SIGNAL: string
}

interface DebugInfo {
  hasValidData?: boolean
  originalResponse?: string
  parsedResult?: any
}

type AppState = 'upload' | 'loading' | 'result' | 'error'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload')
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setAppState('loading')
    setDebugInfo(null)
    setErrorMessage(null)

    // Create a preview of the uploaded image
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)

    try {
      // Validate file before uploading
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Please upload an image file (JPEG, PNG, GIF, WebP).`);
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`);
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)}KB`
      });

      const response = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        
        // Try to parse error as JSON for better error messages
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis)
        setDebugInfo(data.debug || null)
        setAppState('result')
      } else {
        setErrorMessage(data.error || 'Analysis failed. Please try again.')
        setAppState('error')
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Network error'
      setErrorMessage(`Upload failed: ${errorMsg}. Please check your connection and try again.`)
      setAppState('error')
    }
  }

  const handleNewAnalysis = () => {
    setAppState('upload')
    setAnalysisResult(null)
    setDebugInfo(null)
    setErrorMessage(null)
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
      setUploadedImage(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              {/* Logo and Title */}
              <div className="flex items-center justify-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-60"></div>
                  <BarChart3 size={48} className="relative text-white" />
                </motion.div>
                <div>
                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Trading Chart
                  </h1>
                  <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                    Analyzer
                  </h2>
                </div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              >
                AI-powered analysis of trading charts with instant pair detection, 
                <span className="text-purple-300 font-semibold"> trend analysis</span>, and 
                <span className="text-pink-300 font-semibold"> trading signals</span>
              </motion.p>
            </motion.div>

            {/* Enhanced Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism-strong rounded-2xl p-6 text-center group"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <Brain size={32} className="relative text-purple-300 mx-auto" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">AI Analysis</h3>
                <p className="text-white/70 text-sm">Advanced pattern recognition with GPT-4 Vision</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism-strong rounded-2xl p-6 text-center group"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <Zap size={32} className="relative text-pink-300 mx-auto" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">Instant Results</h3>
                <p className="text-white/70 text-sm">Real-time processing in seconds</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism-strong rounded-2xl p-6 text-center group"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <Shield size={32} className="relative text-purple-300 mx-auto" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">Secure</h3>
                <p className="text-white/70 text-sm">Server-side processing & encryption</p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism-strong rounded-2xl p-6 text-center group"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <Sparkles size={32} className="relative text-pink-300 mx-auto" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">Smart</h3>
                <p className="text-white/70 text-sm">Intelligent chart pattern detection</p>
              </motion.div>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl">
            <AnimatePresence mode="wait">
              {appState === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <FileUpload onFileSelect={handleFileSelect} />
                </motion.div>
              )}

              {appState === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <LoadingSpinner />
                </motion.div>
              )}

              {appState === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="glassmorphism-strong rounded-3xl p-8 max-w-2xl mx-auto text-center"
                >
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <AlertCircle size={32} className="text-red-400" />
                    <h3 className="text-2xl font-bold text-white">Analysis Failed</h3>
                  </div>
                  <p className="text-white/80 text-lg mb-6">
                    {errorMessage}
                  </p>
                  <button
                    onClick={handleNewAnalysis}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {appState === 'result' && analysisResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Chart Image and Analysis Side by Side */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Uploaded Chart Image */}
                    {uploadedImage && (
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="glassmorphism-strong rounded-3xl p-6"
                      >
                        <div className="flex items-center space-x-3 mb-6">
                          <Eye size={24} className="text-purple-300" />
                          <h3 className="text-xl font-bold text-white">Uploaded Chart</h3>
                        </div>
                        <div className="relative">
                          <img 
                            src={uploadedImage} 
                            alt="Trading Chart" 
                            className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                            style={{ maxHeight: '500px', objectFit: 'contain' }}
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                      </motion.div>
                    )}

                    {/* Analysis Results */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <AnalysisResult 
                        analysis={analysisResult} 
                        onNewAnalysis={handleNewAnalysis} 
                      />
                    </motion.div>
                  </div>
                  
                  {/* Debug Information */}
                  {debugInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="glassmorphism-strong rounded-3xl p-8"
                    >
                      <div className="flex items-center space-x-3 mb-6">
                        <Cpu size={24} className="text-purple-300" />
                        <h3 className="text-xl font-bold text-white">Analysis Details</h3>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-white/70 font-medium">Data Quality:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            debugInfo.hasValidData 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {debugInfo.hasValidData ? 'High Quality' : 'Partial Data'}
                          </span>
                        </div>
                        {debugInfo.originalResponse && (
                          <div>
                            <span className="text-white/70 font-medium block mb-2">AI Response:</span>
                            <div className="p-4 bg-black/30 rounded-xl text-white/90 font-mono text-xs border border-white/10">
                              {debugInfo.originalResponse}
                            </div>
                          </div>
                        )}
                        {debugInfo.parsedResult && (
                          <div>
                            <span className="text-white/70 font-medium block mb-2">Processed Result:</span>
                            <div className="p-4 bg-black/30 rounded-xl text-white/90 font-mono text-xs border border-white/10">
                              {JSON.stringify(debugInfo.parsedResult, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-4"
            >
              <p className="text-white/70 text-lg">
                © 2024 Trading Chart Analyzer. Built with 
                <span className="text-purple-300 font-semibold mx-1">Next.js</span>, 
                <span className="text-pink-300 font-semibold mx-1">OpenAI</span>, and 
                <span className="text-purple-300 font-semibold mx-1">Tailwind CSS</span>.
              </p>
              <p className="text-white/50 text-sm max-w-2xl mx-auto">
                This tool is for educational purposes only. Always do your own research before making trading decisions. 
                <span className="text-pink-300 font-semibold"> Past performance does not guarantee future results.</span>
              </p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}