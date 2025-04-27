import React from 'react'

export default function InfoModal({ isOpen, title, message, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md relative">
        <h2 className="text-lg font-bold text-blue-600 mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-blue-600"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
