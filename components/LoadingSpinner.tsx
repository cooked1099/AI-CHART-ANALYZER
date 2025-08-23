'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Shield, Sparkles, BarChart3, TrendingUp, Flame } from 'lucide-react'

const LoadingSpinner: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
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
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const rotateVariants = {
    rotate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto text-center space-y-8"
    >
      {/* Main Loading Animation */}
      <motion.div variants={itemVariants} className="relative">
        <div className="relative flex items-center justify-center">
          {/* Outer Ring */}
          <motion.div
            variants={rotateVariants}
            animate="rotate"
            className="absolute w-32 h-32 border-4 border-red-500/30 rounded-full"
          />
          
          {/* Middle Ring */}
          <motion.div
            variants={rotateVariants}
            animate="rotate"
            style={{ animationDirection: 'reverse' }}
            className="absolute w-24 h-24 border-4 border-orange-500/30 rounded-full"
          />
          
          {/* Inner Ring */}
          <motion.div
            variants={rotateVariants}
            animate="rotate"
            className="absolute w-16 h-16 border-4 border-yellow-500/30 rounded-full"
          />
          
          {/* Center Icon */}
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="relative z-10 bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-full"
          >
            <Flame size={32} className="text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Loading Text */}
      <motion.div variants={itemVariants} className="space-y-4">
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Analyzing Chart...
        </motion.h2>
        
        <motion.p 
          className="text-xl text-white/80 max-w-md mx-auto leading-relaxed"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          Our AI is processing your trading chart and extracting patterns
        </motion.p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: "Pattern Recognition",
              description: "Identifying chart patterns and trends",
              color: "from-red-500 to-orange-500",
              delay: 0
            },
            {
              icon: TrendingUp,
              title: "Signal Analysis",
              description: "Generating trading signals",
              color: "from-orange-500 to-yellow-500",
              delay: 1
            },
            {
              icon: Sparkles,
              title: "AI Processing",
              description: "Finalizing analysis results",
              color: "from-yellow-500 to-red-500",
              delay: 2
            }
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.delay }}
              className="glassmorphism rounded-2xl p-6 text-center group"
            >
              <motion.div
                variants={floatVariants}
                animate="float"
                style={{ animationDelay: `${step.delay}s` }}
                className="relative mb-4"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className={`relative bg-gradient-to-r ${step.color} p-3 rounded-xl`}>
                  <step.icon size={24} className="text-white" />
                </div>
              </motion.div>
              <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-white/70 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Animated Dots */}
      <motion.div variants={itemVariants} className="flex items-center justify-center space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Fiery Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="fiery-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Status Messages */}
      <motion.div variants={itemVariants} className="space-y-3">
        <motion.div
          className="flex items-center justify-center space-x-3 text-white/70"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Zap size={16} className="text-orange-400" />
          <span className="text-sm">Processing image data...</span>
        </motion.div>
        
        <motion.div
          className="flex items-center justify-center space-x-3 text-white/70"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Shield size={16} className="text-red-400" />
          <span className="text-sm">Analyzing market patterns...</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default LoadingSpinner