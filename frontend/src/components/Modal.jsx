export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg relative">
          <h2 className="text-lg font-bold text-green-700 mb-4">{title}</h2>
  
          {children}
  
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }
  