'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { BarChart3, Zap, Shield, Brain, Sparkles, TrendingUp, Eye, Cpu, AlertCircle, Coins, Target, Rocket, ChartLine, Flame } from 'lucide-react'
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
  originalResponse?: string
  parsedResult?: any
  hasValidData?: boolean
}

type AppState = 'upload' | 'loading' | 'result' | 'error'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload')
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Parallax values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 700 }
  const x = useSpring(useTransform(mouseX, [0, window.innerWidth], [-20, 20]), springConfig)
  const y = useSpring(useTransform(mouseY, [0, window.innerHeight], [-20, 20]), springConfig)

  useEffect(() => {
    mouseX.set(mousePosition.x)
    mouseY.set(mousePosition.y)
  }, [mousePosition, mouseX, mouseY])

  const handleFileSelect = async (file: File) => {
    setAppState('loading')
    setDebugInfo(null)
    setErrorMessage(null)

    // Create a preview of the uploaded image
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis)
        setDebugInfo(data.debug || null)
        setAppState('result')
      } else {
        throw new Error(data.error || 'No analysis data received')
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
    setDebugInfo(null)
    setErrorMessage(null)
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
      setUploadedImage(null)
    }
  }

  const handleRetry = () => {
    setAppState('upload')
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden">
      {/* Enhanced Fiery Animated Background */}
      <div className="absolute inset-0">
        {/* Fiery Gradient Orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ x, y }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/30 to-red-600/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{ x: useTransform(x, value => -value * 0.5), y: useTransform(y, value => -value * 0.5) }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-600/20 to-orange-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Enhanced Fiery Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="fiery-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Fiery Grid Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,69,0,0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <header className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center space-y-8"
            >
              {/* Enhanced Logo and Title */}
              <div className="flex items-center justify-center space-x-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatDelay: 5,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-3xl blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-3xl">
                    <Flame size={56} className="text-white" />
                  </div>
                </motion.div>
                <div className="space-y-2">
                  <motion.h1 
                    className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                  >
                    Trading Chart
                  </motion.h1>
                  <motion.h2 
                    className="text-4xl md:text-6xl font-black bg-gradient-to-r from-orange-200 to-red-200 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    Analyzer
                  </motion.h2>
                </div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="text-2xl md:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light"
              >
                Advanced AI-powered analysis with 
                <span className="text-orange-300 font-semibold mx-2">real-time pattern recognition</span>, 
                <span className="text-red-300 font-semibold mx-2">precise signal generation</span>, and
                <span className="text-yellow-300 font-semibold mx-2">market trend analysis</span>
              </motion.p>
            </motion.div>

            {/* Enhanced Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            >
              {[
                {
                  icon: Brain,
                  title: "AI Analysis",
                  description: "GPT-4 Vision powered pattern recognition",
                  gradient: "from-red-500 to-orange-500",
                  color: "text-orange-300"
                },
                {
                  icon: Zap,
                  title: "Instant Results",
                  description: "Real-time processing in milliseconds",
                  gradient: "from-orange-500 to-yellow-500",
                  color: "text-yellow-300"
                },
                {
                  icon: Shield,
                  title: "Secure",
                  description: "Enterprise-grade encryption & privacy",
                  gradient: "from-red-600 to-pink-500",
                  color: "text-red-300"
                },
                {
                  icon: Rocket,
                  title: "Advanced",
                  description: "Multi-timeframe signal analysis",
                  gradient: "from-yellow-500 to-orange-500",
                  color: "text-orange-300"
                }
              ].map((feature, index) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className="glassmorphism-strong rounded-3xl p-8 text-center group cursor-pointer"
                >
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
                    <div className="relative bg-gradient-to-r from-white/10 to-white/5 p-4 rounded-2xl backdrop-blur-sm">
                      <feature.icon size={40} className={`${feature.color} mx-auto`} />
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-xl mb-3">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-7xl">
            <AnimatePresence mode="wait">
              {appState === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <FileUpload onFileSelect={handleFileSelect} />
                </motion.div>
              )}

              {appState === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <LoadingSpinner />
                </motion.div>
              )}

              {appState === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="glassmorphism-strong rounded-3xl p-10 max-w-3xl mx-auto"
                >
                  <div className="text-center space-y-8">
                    <motion.div 
                      className="flex items-center justify-center space-x-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg"></div>
                        <AlertCircle size={64} className="relative text-red-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-white">Analysis Failed</h2>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <p className="text-white/90 text-xl leading-relaxed">
                        {errorMessage || 'An error occurred during analysis'}
                      </p>
                      
                      {uploadedImage && (
                        <div className="mt-8">
                          <h3 className="text-white font-semibold mb-4 text-lg">Uploaded Image:</h3>
                          <div className="relative inline-block">
                            <img 
                              src={uploadedImage} 
                              alt="Trading Chart" 
                              className="w-full h-auto rounded-2xl shadow-2xl border border-white/10 max-h-80 object-contain"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div 
                      className="flex flex-col sm:flex-row gap-6 justify-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <button
                        onClick={handleRetry}
                        className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/25"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleNewAnalysis}
                        className="px-10 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                      >
                        Upload New Image
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {appState === 'result' && analysisResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-10"
                >
                  {/* Chart Image and Analysis Side by Side */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Uploaded Chart Image */}
                    {uploadedImage && (
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="glassmorphism-strong rounded-3xl p-8"
                      >
                        <div className="flex items-center space-x-4 mb-8">
                          <div className="relative">
                            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-lg"></div>
                            <Eye size={32} className="relative text-orange-300" />
                          </div>
                          <h3 className="text-2xl font-bold text-white">Uploaded Chart</h3>
                        </div>
                        <div className="relative">
                          <img 
                            src={uploadedImage} 
                            alt="Trading Chart" 
                            className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                            style={{ maxHeight: '600px', objectFit: 'contain' }}
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                      </motion.div>
                    )}

                    {/* Analysis Results */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
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
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="glassmorphism-strong rounded-3xl p-10"
                    >
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg"></div>
                          <Cpu size={32} className="relative text-red-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Analysis Details</h3>
                      </div>
                      <div className="space-y-6 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-white/70 font-medium text-lg">Valid Data Extracted:</span>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            debugInfo.hasValidData 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {debugInfo.hasValidData ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {debugInfo.originalResponse && (
                          <div>
                            <span className="text-white/70 font-medium block mb-3 text-lg">AI Response:</span>
                            <div className="p-6 bg-black/40 rounded-2xl text-white/90 font-mono text-sm border border-white/10 backdrop-blur-sm">
                              {debugInfo.originalResponse}
                            </div>
                          </div>
                        )}
                        {debugInfo.parsedResult && (
                          <div>
                            <span className="text-white/70 font-medium block mb-3 text-lg">Parsed Result:</span>
                            <div className="p-6 bg-black/40 rounded-2xl text-white/90 font-mono text-sm border border-white/10 backdrop-blur-sm">
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
        <footer className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="space-y-6"
            >
              <p className="text-white/70 text-xl">
                © 2024 Trading Chart Analyzer. Built with 
                <span className="text-orange-300 font-semibold mx-2">Next.js</span>, 
                <span className="text-red-300 font-semibold mx-2">OpenAI</span>, and 
                <span className="text-yellow-300 font-semibold mx-2">Tailwind CSS</span>.
              </p>
              <p className="text-white/50 text-base max-w-3xl mx-auto leading-relaxed">
                This tool is for educational purposes only. Always do your own research before making trading decisions. 
                <span className="text-yellow-300 font-semibold mx-1"> Past performance does not guarantee future results.</span>
              </p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}