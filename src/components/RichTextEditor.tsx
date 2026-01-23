import { useMemo, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung...' }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null)

  // Custom toolbar configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: function () {
            const quill = quillRef.current?.getEditor()
            if (!quill) return

            const input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.setAttribute('accept', 'image/*')
            input.click()

            input.onchange = () => {
              const file = input.files?.[0]
              if (file) {
                // Convert to base64 or upload to server
                const reader = new FileReader()
                reader.onload = () => {
                  const range = quill.getSelection(true)
                  quill.insertEmbed(range.index, 'image', reader.result as string, 'user')
                }
                reader.readAsDataURL(file)
              }
            }
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
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
    'video',
  ]

  // Count words (approximate)
  const wordCount = useMemo(() => {
    if (!value) return 0
    const text = value.replace(/<[^>]*>/g, '') // Remove HTML tags
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length
  }, [value])

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="text-xs text-gray-500">
          Số từ: {wordCount}
        </div>
        <div className="text-xs text-gray-500">
          HTML: {value ? 'Có' : 'Không'}
        </div>
      </div>
    </div>
  )
}

export default RichTextEditor

