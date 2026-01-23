import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { Upload, X, Save, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { CreateProductCommand, ProductAttributeCreateDto } from '@/models/Product'
import Select from 'react-select'
import * as tagApi from '@/agent/api/tagApi'
import type { Tag, CreateTagCommand } from '@/models/Tag'
import * as attributeApi from '@/agent/api/attributeApi'
import type { Attribute } from '@/models/Attribute'

const AddProduct = observer(() => {
  const navigate = useNavigate()
  const { productStore, categoryStore } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateProductCommand>({
    name: '',
    sku: '',
    basePrice: 0,
    salePrice: 0,
    salesUnit: 'Thùng',
    priceUnit: 'm²',
    conversionFactor: 1.44,
    categoryId: 0,
    weight: 0,
    imageUrl: '',
    specificationsJson: '',
    isActive: true,
    tag: '',
    saleStartDate: undefined,
    saleEndDate: undefined,
    attributes: [],
  })

  // Checkbox state for sale period
  const [hasSalePeriod, setHasSalePeriod] = useState(false)

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Tags state
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  
  // Modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [newTag, setNewTag] = useState<CreateTagCommand>({
    name: '',
    description: '',
  })
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  // Attributes state
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false)
  
  // Selected attributes state - array of { attributeId, value, extraData, isOpen }
  const [selectedAttributes, setSelectedAttributes] = useState<
    Array<{ attributeId: number; value: string; extraData?: string; isOpen?: boolean }>
  >([])
  
  // Selected attribute for adding (dropdown)
  const [selectedAttributeId, setSelectedAttributeId] = useState<number | null>(null)

  useEffect(() => {
    // Load categories
    if (categoryStore.categories.length === 0) {
      categoryStore.fetchCategories()
    }
    
    // Load tags
    loadTags()
    
    // Load attributes
    loadAttributes()
  }, [categoryStore])

  const loadAttributes = async () => {
    setIsLoadingAttributes(true)
    try {
      const data = await attributeApi.getAttributes()
      setAttributes(data)
    } catch (error) {
      console.error('Failed to load attributes:', error)
    } finally {
      setIsLoadingAttributes(false)
    }
  }

  const loadTags = async () => {
    setIsLoadingTags(true)
    try {
      const data = await tagApi.getTags()
      setTags(data)
    } catch (error) {
      console.error('Failed to load tags:', error)
      // Fallback to default tags if API fails
      setTags([
        { id: 1, name: 'new', description: 'Mới' },
        { id: 2, name: 'sale', description: 'Giảm giá' },
        { id: 3, name: 'hot', description: 'Hot' },
        { id: 4, name: 'pre-order', description: 'Pre-order' },
        { id: 5, name: 'featured', description: 'Nổi bật' },
      ])
    } finally {
      setIsLoadingTags(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTag.name.trim()) {
      alert('Vui lòng nhập tên tag')
      return
    }

    setIsCreatingTag(true)
    try {
      await tagApi.createTag(newTag)
      // Reload tags
      await loadTags()
      // Close modal and reset form
      setIsTagModalOpen(false)
      setNewTag({ name: '', description: '' })
      alert('Tạo tag thành công!')
    } catch (error) {
      console.error('Failed to create tag:', error)
      alert('Có lỗi xảy ra khi tạo tag. Vui lòng thử lại.')
    } finally {
      setIsCreatingTag(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string, // Base64 hoặc URL
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  const handleTagChange = (tagValue: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tag: checked ? tagValue : '',
    }))
  }

  const handleAddAttribute = () => {
    if (!selectedAttributeId) return
    
    // Check if attribute already added
    if (selectedAttributes.some((attr) => attr.attributeId === selectedAttributeId)) {
      alert('Thuộc tính này đã được thêm vào')
      return
    }
    
    const attribute = attributes.find((attr) => attr.id === selectedAttributeId)
    if (attribute) {
      setSelectedAttributes((prev) => [
        ...prev,
        { attributeId: selectedAttributeId, value: '', extraData: '', isOpen: true },
      ])
      setSelectedAttributeId(null)
    }
  }

  const handleRemoveAttribute = (attributeId: number) => {
    setSelectedAttributes((prev) =>
      prev.filter((attr) => attr.attributeId !== attributeId)
    )
  }

  const handleAttributeValueChange = (
    attributeId: number,
    field: 'value' | 'extraData',
    newValue: string
  ) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) =>
        attr.attributeId === attributeId
          ? { ...attr, [field]: newValue }
          : attr
      )
    )
  }

  const toggleAttributeDropdown = (attributeId: number) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) =>
        attr.attributeId === attributeId
          ? { ...attr, isOpen: !attr.isOpen }
          : attr
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert selected attributes to ProductAttributeCreateDto[]
      const productAttributes: ProductAttributeCreateDto[] = selectedAttributes
        .filter((attr) => attr.value.trim() !== '')
        .map((attr) => ({
          attributeId: attr.attributeId,
          value: attr.value.trim(),
          extraData: attr.extraData?.trim() || undefined,
        }))

      const command: CreateProductCommand = {
        ...formData,
        attributes: productAttributes,
      }

      // TODO: Upload image to server first if needed, then get imageUrl
      // For now, using base64 or placeholder

      await productStore.createProduct(command)
      
      // Redirect to products list
      navigate('/admin/products')
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryOptions = categoryStore.categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Thêm sản phẩm mới</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="VD: GACH-MONO-60X60-001"
                  />
                </div>

                {/* Price Section */}
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Base Price - Left */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá gốc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {hasSalePeriod && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày bắt đầu giảm giá
                          </label>
                          <input
                            type="datetime-local"
                            value={
                              formData.saleStartDate
                                ? new Date(formData.saleStartDate).toISOString().slice(0, 16)
                                : ''
                            }
                            onChange={(e) => {
                              const dateValue = e.target.value
                              setFormData((prev) => ({
                                ...prev,
                                saleStartDate: dateValue
                                  ? new Date(dateValue).toISOString()
                                  : undefined,
                              }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Sale Price - Right */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-sm font-medium text-gray-700 flex-1">
                          Giá bán <span className="text-red-500">*</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasSalePeriod}
                            onChange={(e) => {
                              setHasSalePeriod(e.target.checked)
                              if (!e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  saleStartDate: undefined,
                                  saleEndDate: undefined,
                                }))
                              }
                            }}
                            className="w-3 h-3 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-xs text-gray-600">Thời hạn</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {hasSalePeriod && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày kết thúc giảm giá
                          </label>
                          <input
                            type="datetime-local"
                            value={
                              formData.saleEndDate
                                ? new Date(formData.saleEndDate).toISOString().slice(0, 16)
                                : ''
                            }
                            onChange={(e) => {
                              const dateValue = e.target.value
                              setFormData((prev) => ({
                                ...prev,
                                saleEndDate: dateValue
                                  ? new Date(dateValue).toISOString()
                                  : undefined,
                              }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị bán
                    </label>
                    <input
                      type="text"
                      name="salesUnit"
                      value={formData.salesUnit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Thùng"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị giá
                    </label>
                    <input
                      type="text"
                      name="priceUnit"
                      value={formData.priceUnit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="m²"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hệ số quy đổi
                    </label>
                    <input
                      type="number"
                      name="conversionFactor"
                      value={formData.conversionFactor}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    value={categoryOptions.find((opt) => opt.value === formData.categoryId) || null}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: option?.value || 0,
                      }))
                    }
                    options={categoryOptions}
                    placeholder="Chọn danh mục"
                    isSearchable
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trọng lượng (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Kích hoạt sản phẩm
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Attributes Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Thuộc tính</h2>
              
              {isLoadingAttributes ? (
                <div className="text-center py-4 text-gray-500">Đang tải...</div>
              ) : (
                <>
                  {/* Add Attribute */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          className="react-select-container"
                          classNamePrefix="react-select"
                          value={
                            selectedAttributeId
                              ? {
                                  value: selectedAttributeId,
                                  label:
                                    attributes.find((a) => a.id === selectedAttributeId)
                                      ?.name || '',
                                }
                              : null
                          }
                          onChange={(option) =>
                            setSelectedAttributeId(option?.value || null)
                          }
                          options={attributes
                            .filter(
                              (attr) =>
                                !selectedAttributes.some(
                                  (sa) => sa.attributeId === attr.id
                                )
                            )
                            .map((attr) => ({
                              value: attr.id,
                              label: `${attr.name} (${attr.code})`,
                            }))}
                          placeholder="Chọn thuộc tính"
                          isSearchable
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAttribute}
                        disabled={!selectedAttributeId}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Thêm
                      </button>
                    </div>
                  </div>

                  {/* Selected Attributes List */}
                  <div className="space-y-2">
                    {selectedAttributes.map((selectedAttr) => {
                      const attribute = attributes.find(
                        (a) => a.id === selectedAttr.attributeId
                      )
                      if (!attribute) return null

                      const isOpen = selectedAttr.isOpen ?? false

                      return (
                        <div
                          key={selectedAttr.attributeId}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Dropdown Header */}
                          <button
                            type="button"
                            onClick={() => toggleAttributeDropdown(selectedAttr.attributeId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isOpen ? (
                                <ChevronUp size={20} className="text-gray-400" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-400" />
                              )}
                              <div className="text-left">
                                <span className="font-medium text-gray-900">
                                  {attribute.name}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({attribute.code})
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveAttribute(selectedAttr.attributeId)
                              }}
                              className="text-red-600 hover:text-red-700 transition-colors p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </button>

                          {/* Dropdown Content */}
                          {isOpen && (
                            <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá trị <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={selectedAttr.value}
                                    onChange={(e) =>
                                      handleAttributeValueChange(
                                        selectedAttr.attributeId,
                                        'value',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Nhập giá trị"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dữ liệu bổ sung (tùy chọn)
                                  </label>
                                  <input
                                    type="text"
                                    value={selectedAttr.extraData || ''}
                                    onChange={(e) =>
                                      handleAttributeValueChange(
                                        selectedAttr.attributeId,
                                        'extraData',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Nhập dữ liệu bổ sung"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {selectedAttributes.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        Chưa có thuộc tính nào. Hãy chọn và thêm thuộc tính ở trên.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Image Upload & Tags */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Hình ảnh sản phẩm</h2>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click để upload</span> hoặc kéo thả
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Tags Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Tag sản phẩm</h2>
              
              {isLoadingTags ? (
                <div className="text-center py-4 text-gray-500">Đang tải...</div>
              ) : (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.tag === tag.name}
                          onChange={(e) => handleTagChange(tag.name, e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 flex-1">
                          {tag.description || tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsTagModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Plus size={18} />
                    <span className="text-sm font-medium">Thêm tag mới</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </form>

      {/* Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Thêm tag mới</h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsTagModalOpen(false)
                    setNewTag({ name: '', description: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên tag <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTag.name}
                    onChange={(e) =>
                      setNewTag((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="VD: new, sale, hot..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả (tùy chọn)
                  </label>
                  <textarea
                    value={newTag.description}
                    onChange={(e) =>
                      setNewTag((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Mô tả về tag này..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsTagModalOpen(false)
                    setNewTag({ name: '', description: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={isCreatingTag || !newTag.name.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTag ? 'Đang tạo...' : 'Tạo tag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default AddProduct

