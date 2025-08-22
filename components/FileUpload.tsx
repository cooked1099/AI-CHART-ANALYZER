'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

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
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`relative upload-area glassmorphism rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver ? 'dragover' : ''
            } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
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
            
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="relative">
                <Upload 
                  size={48} 
                  className={`transition-colors duration-300 ${
                    isDragOver ? 'text-trading-green' : 'text-white/70'
                  }`} 
                />
                {isDragOver && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-trading-green/20 rounded-full"
                    style={{ width: '48px', height: '48px' }}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  {isDragOver ? 'Drop your chart here' : 'Upload Trading Chart'}
                </h3>
                <p className="text-white/70 text-sm">
                  Drag and drop your chart screenshot here, or click to browse
                </p>
                <p className="text-white/50 text-xs">
                  Supports PNG, JPG • Max 10MB
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="selected-file"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glassmorphism-strong rounded-2xl p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <ImageIcon size={40} className="text-trading-blue" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-white/70 text-sm">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              
              <button
                onClick={handleReset}
                className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Remove file"
              >
                <X size={20} className="text-white/70 hover:text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload