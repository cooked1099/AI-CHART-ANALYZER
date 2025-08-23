'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Sparkles, Zap } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
      const file = files[0]
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleReset = useCallback(() => {
    setSelectedFile(null)
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`relative upload-area glassmorphism-strong rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 ${
              isDragOver ? 'dragover scale-105' : ''
            } ${isLoading ? 'pointer-events-none opacity-50' : 'hover:scale-105'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileInput}
              className="hidden"
              disabled={isLoading}
            />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-500/5 to-red-500/5"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-sky-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 flex flex-col items-center space-y-6"
            >
              {/* Main Upload Icon */}
              <motion.div
                animate={{ 
                  y: isDragOver ? -10 : 0,
                  scale: isDragOver ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-red-400 rounded-3xl blur-xl opacity-40"></div>
                <div className="relative bg-gradient-to-r from-sky-500 to-red-500 p-6 rounded-3xl">
                  <Upload size={48} className="text-white" />
                </div>
              </motion.div>

              {/* Title and Description */}
              <div className="space-y-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl md:text-4xl font-bold text-white"
                >
                  Upload Trading Chart
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed"
                >
                  Drag and drop your trading chart screenshot here, or click to browse
                </motion.p>
              </div>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
              >
                <div className="flex items-center space-x-3 text-white/80">
                  <Sparkles size={20} className="text-sky-300" />
                  <span className="text-sm">AI-Powered Analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-white/80">
                  <Zap size={20} className="text-blue-300" />
                  <span className="text-sm">Instant Results</span>
                </div>
                <div className="flex items-center space-x-3 text-white/80">
                  <ImageIcon size={20} className="text-red-300" />
                  <span className="text-sm">PNG, JPG Support</span>
                </div>
              </motion.div>

              {/* Upload Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-r from-sky-500 to-red-500 hover:from-red-500 hover:to-sky-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl btn-glow"
              >
                Choose File
              </motion.button>
            </motion.div>

            {/* Drag Over Effect */}
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-red-500/20 rounded-3xl border-2 border-dashed border-white/50"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="selected-file"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glassmorphism-strong rounded-3xl p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-sky-500 to-red-500 p-3 rounded-2xl">
                  <ImageIcon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
                  <p className="text-white/70 text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded-xl transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload