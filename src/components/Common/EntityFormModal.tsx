import { type ReactNode } from 'react'
import { X } from 'lucide-react'

interface EntityFormModalProps {
  isOpen: boolean
  modalTitle: string
  nameLabel?: string
  namePlaceholder?: string
  nameValue: string
  onNameChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
  submitText?: string
  cancelText?: string
  isSubmitting?: boolean
  children?: ReactNode
}

const EntityFormModal = ({
  isOpen,
  modalTitle,
  nameLabel = 'Tiêu đề',
  namePlaceholder = 'Nhập tiêu đề',
  nameValue,
  onNameChange,
  onClose,
  onSubmit,
  submitText = 'Lưu',
  cancelText = 'Hủy',
  isSubmitting = false,
  children,
}: EntityFormModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-xl rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{modalTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {nameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={namePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {children}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang xử lý...' : submitText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EntityFormModal
