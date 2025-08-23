'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Analyzing Chart..." 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto text-center space-y-6"
    >
      {/* Loading Animation */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto"
        >
          <div className="w-full h-full border-4 border-white/10 border-t-orange-500 rounded-full" />
        </motion.div>
        
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <BarChart3 size={32} className="text-orange-400" />
        </motion.div>
      </div>

      {/* Loading Text */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">
          AI Analysis in Progress
        </h3>
        <p className="text-white/80 text-sm">
          {message}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2
            }}
            className="w-2 h-2 bg-orange-400 rounded-full"
          />
        ))}
      </div>

      {/* Status Messages */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-white/60 text-xs space-y-1"
      >
        <p>• Detecting trading pair and timeframe</p>
        <p>• Analyzing price action and indicators</p>
        <p>• Generating trading signal</p>
      </motion.div>
    </motion.div>
  )
}

export default LoadingSpinner