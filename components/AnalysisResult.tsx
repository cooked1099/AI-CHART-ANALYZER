'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Eye, EyeOff, Target, Zap, BarChart3, Clock, Coins, Flame } from 'lucide-react'

interface AnalysisData {
  PAIR: string
  TIMEFRAME: string
  TREND: string
  SIGNAL: string
}

interface AnalysisResultProps {
  analysis: AnalysisData
  onNewAnalysis: () => void
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onNewAnalysis }) => {
  const getTrendIcon = (trend: string) => {
    if (trend === 'NOT VISIBLE') return <EyeOff className="text-gray-400" size={24} />
    
    switch (trend.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="text-trading-green" size={24} />
      case 'bearish':
        return <TrendingDown className="text-trading-red" size={24} />
      case 'sideways':
        return <Minus className="text-trading-blue" size={24} />
      default:
        return <EyeOff className="text-gray-400" size={24} />
    }
  }

  const getSignalIcon = (signal: string) => {
    if (signal === 'NOT VISIBLE') return <EyeOff className="text-gray-400" size={24} />
    
    switch (signal.toLowerCase()) {
      case 'up':
        return <ArrowUp className="signal-up" size={24} />
      case 'down':
        return <ArrowDown className="signal-down" size={24} />
      default:
        return <EyeOff className="text-gray-400" size={24} />
    }
  }

  const getTrendClass = (trend: string) => {
    if (trend === 'NOT VISIBLE') return 'text-gray-400'
    
    switch (trend.toLowerCase()) {
      case 'bullish':
        return 'trend-bullish'
      case 'bearish':
        return 'trend-bearish'
      case 'sideways':
        return 'trend-sideways'
      default:
        return 'text-white'
    }
  }

  const getSignalClass = (signal: string) => {
    if (signal === 'NOT VISIBLE') return 'text-gray-400'
    
    switch (signal.toLowerCase()) {
      case 'up':
        return 'signal-up'
      case 'down':
        return 'signal-down'
      default:
        return 'text-white'
    }
  }

  const getValueDisplay = (value: string, label: string, icon: any) => {
    if (value === 'NOT VISIBLE') {
      return (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gray-500/20 rounded-full blur-lg"></div>
            <EyeOff size={20} className="relative text-gray-400" />
          </div>
          <span className="text-gray-400 italic font-medium">Not visible in chart</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-lg opacity-30"></div>
          <icon size={20} className="relative text-white" />
        </div>
        <span className="text-white font-bold text-lg">{value}</span>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Check if any data was successfully extracted
  const hasValidData = Object.values(analysis).some(value => value !== 'NOT VISIBLE')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <motion.div
          variants={pulseVariants}
          animate="pulse"
          className="flex items-center justify-center space-x-3"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-40"></div>
            <div className="relative bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-full">
              <Flame size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
            Analysis Complete
          </h2>
        </motion.div>
        <p className="text-xl text-white/80 leading-relaxed">
          AI-powered trading chart analysis results
        </p>
      </motion.div>

      {/* Analysis Results */}
      <motion.div
        variants={itemVariants}
        className="glassmorphism-strong rounded-3xl p-8"
      >
        <div className="space-y-6">
          {/* Trading Pair */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-lg opacity-30"></div>
                <Coins size={24} className="relative text-red-300" />
              </div>
              <span className="text-white/70 font-semibold text-lg">Trading Pair</span>
            </div>
            {getValueDisplay(analysis.PAIR, 'PAIR', Coins)}
          </div>
          
          {/* Timeframe */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur-lg opacity-30"></div>
                <Clock size={24} className="relative text-orange-300" />
              </div>
              <span className="text-white/70 font-semibold text-lg">Timeframe</span>
            </div>
            {getValueDisplay(analysis.TIMEFRAME, 'TIMEFRAME', Clock)}
          </div>
          
          {/* Trend */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-lg opacity-30"></div>
                <BarChart3 size={24} className="relative text-yellow-300" />
              </div>
              <span className="text-white/70 font-semibold text-lg">Current Trend</span>
            </div>
            <div className="flex items-center space-x-3">
              {getTrendIcon(analysis.TREND)}
              <span className={`font-bold text-xl ${getTrendClass(analysis.TREND)}`}>
                {analysis.TREND === 'NOT VISIBLE' ? 'Not visible' : analysis.TREND}
              </span>
            </div>
          </div>
          
          {/* Signal */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-500 rounded-full blur-lg opacity-30"></div>
                <Zap size={24} className="relative text-red-300" />
              </div>
              <span className="text-white/70 font-semibold text-lg">Trading Signal</span>
            </div>
            <div className="flex items-center space-x-3">
              {getSignalIcon(analysis.SIGNAL)}
              <span className={`font-bold text-xl ${getSignalClass(analysis.SIGNAL)}`}>
                {analysis.SIGNAL === 'NOT VISIBLE' ? 'Not visible' : analysis.SIGNAL}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Signal Summary */}
      {hasValidData && (
        <motion.div
          variants={itemVariants}
          className="glassmorphism rounded-3xl p-8 border border-white/20"
        >
          <div className="text-center space-y-6">
            <motion.h3 
              className="text-2xl font-bold text-white"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Trading Signal
            </motion.h3>
            <motion.div 
              className="flex items-center justify-center space-x-4"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {getSignalIcon(analysis.SIGNAL)}
              <span className={`text-3xl font-black ${getSignalClass(analysis.SIGNAL)}`}>
                {analysis.SIGNAL === 'NOT VISIBLE' ? 'Not visible' : analysis.SIGNAL}
              </span>
            </motion.div>
            <p className="text-white/70 text-lg">
              Based on {analysis.PAIR !== 'NOT VISIBLE' ? analysis.PAIR : 'chart'} {analysis.TIMEFRAME !== 'NOT VISIBLE' ? analysis.TIMEFRAME : ''} analysis
            </p>
          </div>
        </motion.div>
      )}

      {/* Warning if no data was extracted */}
      {!hasValidData && (
        <motion.div
          variants={itemVariants}
          className="glassmorphism rounded-3xl p-8 border border-yellow-500/30"
        >
          <div className="text-center space-y-4">
            <motion.div 
              className="flex items-center justify-center space-x-3"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg"></div>
                <EyeOff size={32} className="relative text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-400">
                Limited Analysis
              </h3>
            </motion.div>
            <p className="text-white/80 text-lg leading-relaxed">
              Could not extract trading information from the chart. Please ensure the image is clear and contains visible trading data.
            </p>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.div
        variants={itemVariants}
        className="text-center"
      >
        <motion.button
          onClick={onNewAnalysis}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-red-500/25"
        >
          New Analysis
        </motion.button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        variants={itemVariants}
        className="text-center"
      >
        <div className="glassmorphism rounded-2xl p-6 border border-white/10">
          <p className="text-white/60 text-sm leading-relaxed">
            ⚠️ This analysis is for educational purposes only. Always do your own research and never invest more than you can afford to lose. 
            <span className="text-yellow-300 font-semibold block mt-2">Past performance does not guarantee future results.</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AnalysisResult