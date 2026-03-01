import { useMemo, useRef, useState, type CSSProperties } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import MediaPicker from '@/components/Images/MediaPicker'
import type { AppImageDto } from '@/models/Image'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  minHeight?: number
  showMeta?: boolean
}

const RichTextEditor = ({
  value,
  onChange,
  label,
  placeholder = 'Nhập nội dung...',
  minHeight = 220,
  showMeta = true,
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null)
  const imageInsertIndexRef = useRef<number | null>(null)
  const [mode, setMode] = useState<'visual' | 'html'>('visual')
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ size: ['small', false, 'large'] }],
          ['bold', 'italic', 'underline'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['blockquote'],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: function () {
            const quill = quillRef.current?.getEditor()
            if (!quill) return

            const range = quill.getSelection(true)
            imageInsertIndexRef.current = range?.index ?? quill.getLength()
            setIsMediaPickerOpen(true)
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  )

  const formats = [
    'header',
    'size',
    'bold',
    'italic',
    'underline',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'blockquote',
    'link',
    'image',
  ]

  const wordCount = useMemo(() => {
    if (!value) return 0
    const text = value.replace(/<[^>]*>/g, '') // Remove HTML tags
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length
  }, [value])

  const charCount = useMemo(() => {
    if (!value) return 0
    return value.replace(/<[^>]*>/g, '').length
  }, [value])

  const wrapperStyle = useMemo(
    () => ({ '--rte-min-height': `${minHeight}px` }) as CSSProperties,
    [minHeight]
  )

  return (
    <>
      <div className="rich-text-editor-wrapper" style={wrapperStyle}>
        <div className="flex items-center justify-between border border-gray-200 border-b-0 rounded-t-md bg-gray-50 px-3 py-2">
          <div className="text-sm font-medium text-gray-700">{label || 'Nội dung'}</div>
          <div className="inline-flex rounded border border-gray-300 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setMode('visual')}
              className={`px-3 py-1.5 ${
                mode === 'visual' ? 'bg-white text-gray-900 font-medium' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Trực quan
            </button>
            <button
              type="button"
              onClick={() => setMode('html')}
              className={`px-3 py-1.5 border-l border-gray-300 ${
                mode === 'html' ? 'bg-white text-gray-900 font-medium' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Văn bản
            </button>
          </div>
        </div>

        {mode === 'visual' ? (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-b-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ minHeight }}
          />
        )}

        {showMeta && (
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="text-xs text-gray-500">Số từ: {wordCount}</div>
            <div className="text-xs text-gray-500">Ký tự: {charCount}</div>
          </div>
        )}
      </div>

      {isMediaPickerOpen && (
        <MediaPicker
          onClose={() => setIsMediaPickerOpen(false)}
          multiSelect={false}
          onSelect={(imgOrImgs: AppImageDto | AppImageDto[]) => {
            const selectedImage = Array.isArray(imgOrImgs) ? imgOrImgs[0] : imgOrImgs
            if (!selectedImage?.url) return

            const quill = quillRef.current?.getEditor()
            if (!quill) return

            const insertIndex = imageInsertIndexRef.current ?? quill.getLength()
            quill.insertEmbed(insertIndex, 'image', selectedImage.url, 'user')
            quill.setSelection(insertIndex + 1, 0, 'user')
            imageInsertIndexRef.current = null
          }}
        />
      )}
    </>
  )
}

export default RichTextEditor

