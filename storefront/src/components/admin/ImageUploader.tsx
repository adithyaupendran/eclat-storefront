'use client'

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  existingUrls?: string[]
  onUrlsChange: (urls: string[]) => void
}

export function ImageUploader({ existingUrls = [], onUrlsChange }: ImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.error) { setError(data.error); return }
    const newUrls = [...urls, data.url]
    setUrls(newUrls)
    onUrlsChange(newUrls)
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }

  const removeUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index)
    setUrls(newUrls)
    onUrlsChange(newUrls)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-sm text-gray-400">Uploading...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-500">Drop images here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP supported</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div key={i} className="relative w-20 h-24 bg-gray-100 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">MAIN</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
