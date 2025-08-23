'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'

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
    if (trend === 'NOT VISIBLE') return <EyeOff className="text-gray-400" size={20} />
    
    switch (trend.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="text-trading-green" size={20} />
      case 'bearish':
        return <TrendingDown className="text-trading-red" size={20} />
      case 'sideways':
        return <Minus className="text-trading-blue" size={20} />
      default:
        return <EyeOff className="text-gray-400" size={20} />
    }
  }

  const getSignalIcon = (signal: string) => {
    if (signal === 'NOT VISIBLE') return <EyeOff className="text-gray-400" size={20} />
    
    switch (signal.toLowerCase()) {
      case 'up':
        return <ArrowUp className="signal-up" size={20} />
      case 'down':
        return <ArrowDown className="signal-down" size={20} />
      default:
        return <EyeOff className="text-gray-400" size={20} />
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

  const getValueDisplay = (value: string, label: string) => {
    if (value === 'NOT VISIBLE') {
      return (
        <div className="flex items-center space-x-2">
          <EyeOff className="text-gray-400" size={16} />
          <span className="text-gray-400 italic">Not visible in chart</span>
        </div>
      )
    }
    return <span className="text-white font-semibold">{value}</span>
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  // Check if any data was successfully extracted
  const hasValidData = Object.values(analysis).some(value => value !== 'NOT VISIBLE')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Analysis Complete
        </h2>
        <p className="text-white/70">
          AI-powered trading chart analysis results
        </p>
      </motion.div>

      {/* Analysis Results */}
      <motion.div
        variants={itemVariants}
        className="glassmorphism-strong rounded-2xl p-6"
      >
        <div className="result-code rounded-lg p-4 font-mono text-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70">PAIR:</span>
            {getValueDisplay(analysis.PAIR, 'PAIR')}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70">TIMEFRAME:</span>
            {getValueDisplay(analysis.TIMEFRAME, 'TIMEFRAME')}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70">TREND:</span>
            <div className="flex items-center space-x-2">
              {getTrendIcon(analysis.TREND)}
              <span className={`font-semibold ${getTrendClass(analysis.TREND)}`}>
                {analysis.TREND === 'NOT VISIBLE' ? 'Not visible' : analysis.TREND}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70">SIGNAL:</span>
            <div className="flex items-center space-x-2">
              {getSignalIcon(analysis.SIGNAL)}
              <span className={`font-semibold ${getSignalClass(analysis.SIGNAL)}`}>
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
          className="glassmorphism rounded-xl p-4"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Trading Signal
            </h3>
            <div className="flex items-center justify-center space-x-3">
              {getSignalIcon(analysis.SIGNAL)}
              <span className={`text-xl font-bold ${getSignalClass(analysis.SIGNAL)}`}>
                {analysis.SIGNAL === 'NOT VISIBLE' ? 'Not visible' : analysis.SIGNAL}
              </span>
            </div>
            <p className="text-white/70 text-sm mt-2">
              Based on {analysis.PAIR !== 'NOT VISIBLE' ? analysis.PAIR : 'chart'} {analysis.TIMEFRAME !== 'NOT VISIBLE' ? analysis.TIMEFRAME : ''} analysis
            </p>
          </div>
        </motion.div>
      )}

      {/* Warning if no data was extracted */}
      {!hasValidData && (
        <motion.div
          variants={itemVariants}
          className="glassmorphism rounded-xl p-4 border border-yellow-500/30"
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <EyeOff className="text-yellow-400" size={20} />
              <h3 className="text-lg font-semibold text-yellow-400">
                Limited Analysis
              </h3>
            </div>
            <p className="text-white/70 text-sm">
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
        <button
          onClick={onNewAnalysis}
          className="bg-gradient-to-r from-trading-green to-trading-blue hover:from-trading-blue hover:to-trading-green text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          New Analysis
        </button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        variants={itemVariants}
        className="text-center"
      >
        <p className="text-white/50 text-xs">
          ⚠️ This analysis is for educational purposes only. Always do your own research and never invest more than you can afford to lose.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default AnalysisResult