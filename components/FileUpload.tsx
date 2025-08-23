'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileImage, X, CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)')
      return false
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return false
    }

    setError(null)
    return true
  }

  const handleFile = useCallback((file: File) => {
    if (!validateFile(file)) return

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleAnalyze = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }, [selectedFile, onFileSelect])

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-40"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-cyan-600 p-3 rounded-full">
              <Sparkles size={32} className="text-white" />
            </div>
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Upload Trading Chart
          </h2>
        </div>
        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Drag and drop your trading chart screenshot or click to browse. 
          Our AI will analyze patterns, trends, and generate trading signals.
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div variants={itemVariants} className="relative">
        <div
          className={`relative border-3 border-dashed rounded-3xl p-12 transition-all duration-500 ${
            isDragOver 
              ? 'border-cyan-400 bg-cyan-500/10 scale-105' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
          
          {/* Animated Border */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{
              background: isDragOver 
                ? "linear-gradient(45deg, #00D4AA, #667eea, #00D4AA)" 
                : "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05), rgba(255,255,255,0.1))"
            }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundSize: "200% 200%",
              animation: isDragOver ? "gradient 2s ease infinite" : "none"
            }}
          />
          
          <div className="relative z-10">
            {!selectedFile ? (
              <div className="text-center space-y-6">
                {/* Upload Icon */}
                <motion.div
                  animate={isDragOver ? { scale: 1.2, rotate: 360 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-xl opacity-30"></div>
                    <div className="relative bg-gradient-to-r from-purple-600 to-cyan-600 p-6 rounded-full">
                      <Upload size={48} className="text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Upload Text */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">
                    {isDragOver ? 'Drop your chart here' : 'Choose your trading chart'}
                  </h3>
                  <p className="text-white/70 text-lg">
                    {isDragOver 
                      ? 'Release to upload and analyze' 
                      : 'Drag & drop or click to browse files'
                    }
                  </p>
                </div>

                {/* File Types */}
                <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
                  <div className="flex items-center space-x-2">
                    <FileImage size={16} />
                    <span>JPEG</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileImage size={16} />
                    <span>PNG</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileImage size={16} />
                    <span>WebP</span>
                  </div>
                </div>

                {/* Browse Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                >
                  Browse Files
                </motion.button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Preview */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <img 
                      src={preview!} 
                      alt="Chart Preview" 
                      className="w-full h-auto max-h-80 rounded-2xl shadow-2xl border border-white/10"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* File Info */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <CheckCircle size={24} className="text-green-400" />
                    <span className="text-white font-semibold text-lg">{selectedFile.name}</span>
                  </div>
                  <p className="text-white/70">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyze}
                    className="flex items-center justify-center space-x-3 px-10 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
                  >
                    <Zap size={20} />
                    <span>Analyze Chart</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemoveFile}
                    className="flex items-center justify-center space-x-3 px-10 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl"
                  >
                    <X size={20} />
                    <span>Remove</span>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mt-6 flex items-center justify-center space-x-3 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl"
            >
              <AlertCircle size={20} className="text-red-400" />
              <span className="text-red-300 font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Features */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Sparkles,
            title: "AI Analysis",
            description: "Advanced pattern recognition with GPT-4 Vision"
          },
          {
            icon: Zap,
            title: "Instant Results",
            description: "Get trading signals in seconds"
          },
          {
            icon: Shield,
            title: "Secure",
            description: "Your data is processed securely"
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="glassmorphism rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <feature.icon size={32} className="relative text-cyan-300 mx-auto" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
            <p className="text-white/70 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </motion.div>
  )
}

export default FileUpload