import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store";
import {
  X,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { CreateProductCommand } from "@/models/Product";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import * as tagApi from "@/agent/api/tagApi";
import type { TagDto, CreateTagCommand } from "@/models/Tag";
import * as attributeApi from "@/agent/api/attributeApi";
import type { Attribute } from "@/models/Attribute";
import type { CategoryDto } from "@/models/Category";
import { ProductAttributeCreateDto } from "@/models/ProductAttribute";
import ImageChoser from "@/components/Images/ImageChoser";
import MediaPicker from "@/components/Images/MediaPicker";
import type { AppImageDto } from "@/models/Image";
import RichTextEditor from "@/components/RichTextEditor";

const AddProduct = observer(() => {
  const navigate = useNavigate();
  const { productStore, categoryStore, tagStore, attributeValueStore } =
    useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateProductCommand>({
    name: "",
    sku: "",
    slug: "",
    shortDescription: "",
    description: "",
    basePrice: 0,
    salePrice: 0,
    salesUnit: "Thùng",
    priceUnit: "m²",
    conversionFactor: 1.44,
    width: 0,
    height: 0,
    thickness: 0,
    random: 0,
    boxQuantity: 0,
    categoryId: 0,
    categoryIds: [],
    weight: 0,
    thumbnailUrl: "",
    imageIds: [],
    specificationsJson: "",
    isActive: true,
    tag: "",
    saleStartDate: undefined,
    saleEndDate: undefined,
    attributes: [],
  });

  // Checkbox state for sale period
  const [hasSalePeriod, setHasSalePeriod] = useState(false);

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [, setImageFile] = useState<File | null>(null);

  // Tags state
  const [tags, setTags] = useState<TagDto[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // Modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTag, setNewTag] = useState<CreateTagCommand>({
    name: "",
    description: "",
  });
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [productImages, setProductImages] = useState<AppImageDto[]>([]);

  // Attributes state
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);

  // Selected attributes state - array of { attributeId, value, extraData, isOpen }
  const [selectedAttributes, setSelectedAttributes] = useState<
    Array<{
      attributeId: number;
      attributeValueId?: number;
      value: string;
      extraData?: string;
      isOpen?: boolean;
    }>
  >([]);

  // Custom specifications (saved in specificationsJson)
  const [customSpecifications, setCustomSpecifications] = useState<
    Array<{
      key: string;
      value: string;
      isOpen?: boolean;
    }>
  >([]);

  const [
    attributeValueOptionsByAttributeId,
    setAttributeValueOptionsByAttributeId,
  ] = useState<
    Record<
      number,
      Array<{ id: number; value: string; label: string; extraData?: string }>
    >
  >({});

  // Category box UI state
  const [isCategoryBoxOpen, setIsCategoryBoxOpen] = useState(true);
  const [categoryTab, setCategoryTab] = useState<"all" | "popular">("all");

  useEffect(() => {
    // Load categories
    if (categoryStore.categories.length === 0) {
      categoryStore.fetchCategories();
    }

    if (tagStore.tags.length === 0) {
      tagStore.fetchTags();
    }

    // Load tags
    loadTags();

    // Load attributes
    loadAttributes();
  }, [categoryStore, tagStore]);

  const loadAttributes = async () => {
    setIsLoadingAttributes(true);
    try {
      const data = await attributeApi.getAttributes();
      setAttributes(data);
    } catch (error) {
      console.error("Failed to load attributes:", error);
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  const loadTags = async () => {
    setIsLoadingTags(true);
    try {
      const data = await tagApi.getTags();
      setTags(data);
    } catch (error) {
      console.error("Failed to load tags:", error);
      // Fallback to default tags if API fails
      setTags([
        { id: 1, name: "new", description: "Mới" },
        { id: 2, name: "sale", description: "Giảm giá" },
        { id: 3, name: "hot", description: "Hot" },
        { id: 4, name: "pre-order", description: "Pre-order" },
        { id: 5, name: "featured", description: "Nổi bật" },
      ]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.name.trim()) {
      alert("Vui lòng nhập tên tag");
      return;
    }

    setIsCreatingTag(true);
    try {
      await tagApi.createTag(newTag);
      // Reload tags
      await loadTags();
      // Close modal and reset form
      setIsTagModalOpen(false);
      setNewTag({ name: "", description: "" });
      alert("Tạo tag thành công!");
    } catch (error) {
      console.error("Failed to create tag:", error);
      alert("Có lỗi xảy ra khi tạo tag. Vui lòng thử lại.");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleAddProductImages = (imgs: AppImageDto[]) => {
    // append new images avoiding duplicates
    setProductImages((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      imgs.forEach((img) => {
        if (!existingIds.has(img.id)) merged.push(img);
      });
      // update formData imageIds too
      setFormData((prev) => ({ ...prev, imageIds: merged.map((m) => m.id) }));
      return merged;
    });
  };

  const removeProductImage = (id: number) => {
    setProductImages((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setFormData((prevForm) => ({
        ...prevForm,
        imageIds: next.map((m) => m.id),
      }));
      return next;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleImageChange = (
    payload: React.ChangeEvent<HTMLInputElement> | File[] | string | null,
  ) => {
    // Accept either an input change event, an array of Files, or a URL string from the media picker
    if (!payload) return;

    // If called with a string (URL)
    if (typeof payload === "string") {
      setImagePreview(payload);
      setFormData((prev) => ({ ...prev, imageUrl: payload }));
      return;
    }

    // If called with File[]
    if (Array.isArray(payload)) {
      const file = payload[0];
      if (!file) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      return;
    }

    // Otherwise assume it's an input change event
    try {
      const e = payload as React.ChangeEvent<HTMLInputElement>;
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setFormData((prev) => ({
            ...prev,
            imageUrl: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("handleImageChange: unexpected payload", err);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleTagChange = (tagValue: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tag: checked ? tagValue : "",
    }));
  };

  const serializeSpecificationsJson = (
    specs: Array<{ key: string; value: string; isOpen?: boolean }>,
  ) => {
    const normalized = specs
      .map((item) => ({ key: item.key.trim(), value: item.value.trim() }))
      .filter((item) => item.key !== "");

    if (normalized.length === 0) return "";

    const specificationsObject = normalized.reduce<Record<string, string>>(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      {},
    );

    return JSON.stringify(specificationsObject);
  };

  const handleAddAttribute = (attributeId?: number | null) => {
    if (!attributeId) return;

    // Check if attribute already added
    if (selectedAttributes.some((attr) => attr.attributeId === attributeId)) {
      alert("Thuộc tính này đã được thêm vào");
      return;
    }

    const attribute = attributes.find((attr) => attr.id === attributeId);
    if (attribute) {
      void loadAttributeValues(attributeId);
      setSelectedAttributes((prev) => [
        ...prev,
        {
          attributeId,
          attributeValueId: undefined,
          value: "",
          extraData: "",
          isOpen: true,
        },
      ]);
    }
  };

  const handleAddCustomSpecification = () => {
    setCustomSpecifications((prev) => [
      ...prev,
      { key: "", value: "", isOpen: true },
    ]);
  };

  const handleCustomSpecificationChange = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    setCustomSpecifications((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: newValue } : item,
      ),
    );
  };

  const handleRemoveCustomSpecification = (index: number) => {
    setCustomSpecifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleCustomSpecificationDropdown = (index: number) => {
    setCustomSpecifications((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isOpen: !item.isOpen } : item,
      ),
    );
  };

  const handleRemoveAttribute = (attributeId: number) => {
    setSelectedAttributes((prev) =>
      prev.filter((attr) => attr.attributeId !== attributeId),
    );
  };

  const handleAttributeValueChange = (
    attributeId: number,
    field: "value" | "extraData",
    newValue: string,
  ) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) =>
        attr.attributeId === attributeId
          ? { ...attr, [field]: newValue }
          : attr,
      ),
    );
  };

  const toggleAttributeDropdown = (attributeId: number) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) =>
        attr.attributeId === attributeId
          ? { ...attr, isOpen: !attr.isOpen }
          : attr,
      ),
    );
  };

  const loadAttributeValues = async (attributeId: number) => {
    try {
      await attributeValueStore.fetchAttributeValues(attributeId);
      const values = attributeValueStore.getValuesByAttributeId(attributeId);
      const uniqueMap = new Map<
        string,
        { id: number; value: string; label: string; extraData?: string }
      >();

      values.forEach((item) => {
        if (!item.value) return;
        if (!uniqueMap.has(item.value)) {
          uniqueMap.set(item.value, {
            id: item.id,
            value: item.value,
            label: item.value,
            extraData: item.extraData,
          });
        }
      });

      setAttributeValueOptionsByAttributeId((prev) => ({
        ...prev,
        [attributeId]: Array.from(uniqueMap.values()),
      }));
    } catch (error) {
      console.error("Failed to load attribute values:", error);
    }
  };

  useEffect(() => {
    selectedAttributes.forEach((attr) => {
      if (!attributeValueOptionsByAttributeId[attr.attributeId]) {
        void loadAttributeValues(attr.attributeId);
      }
    });
  }, [selectedAttributes, attributeValueOptionsByAttributeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate at least one category selected
      if (!formData.categoryIds || formData.categoryIds.length === 0) {
        alert("Vui lòng chọn ít nhất một danh mục cho sản phẩm");
        setIsSubmitting(false);
        return;
      }

      // Convert selected attributes to ProductAttributeCreateDto[]
      const selectedAttributesWithValue = selectedAttributes.filter(
        (attr) => attr.value.trim() !== "",
      );

      const productAttributes: ProductAttributeCreateDto[] =
        selectedAttributesWithValue
          .map((attr) => {
            const trimmedValue = attr.value.trim();
            const matchedOption = (
              attributeValueOptionsByAttributeId[attr.attributeId] || []
            ).find((opt) => opt.value === trimmedValue);

            const attributeValueId = attr.attributeValueId ?? matchedOption?.id;
            if (!attributeValueId) return null;

            return {
              attributeId: attr.attributeId,
              attributeValueId,
            };
          })
          .filter((attr): attr is ProductAttributeCreateDto => attr !== null);

      if (productAttributes.length !== selectedAttributesWithValue.length) {
        alert(
          "Một số thuộc tính chưa có giá trị hợp lệ. Vui lòng chọn giá trị có sẵn cho tất cả thuộc tính",
        );
        setIsSubmitting(false);
        return;
      }

      const command: CreateProductCommand = {
        ...formData,
        // Đảm bảo categoryId khớp với danh mục đầu tiên (nếu backend vẫn dùng)
        categoryId: formData.categoryIds[0] ?? 0,
        specificationsJson: serializeSpecificationsJson(customSpecifications),
        attributes: productAttributes,
      };

      // TODO: Upload image to server first if needed, then get imageUrl
      // For now, using base64 or placeholder

      await productStore.createProduct(command);

      // Redirect to products list
      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildCategoryOptions = (categories: CategoryDto[]) => {
    const byParent = new Map<number | null, CategoryDto[]>();
    categories.forEach((cat) => {
      const key = cat.parentId ?? null;
      const list = byParent.get(key) || [];
      list.push(cat);
      byParent.set(key, list);
    });

    const result: Array<{ id: number; label: string; level: number }> = [];
    const walk = (parentId: number | null, level: number) => {
      const list = byParent.get(parentId) || [];
      list.forEach((cat) => {
        result.push({ id: cat.id, label: cat.name, level });
        walk(cat.id, level + 1);
      });
    };

    walk(null, 0);
    return result;
  };

  const categoryOptions = buildCategoryOptions(categoryStore.categories);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/products")}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả ngắn
                  </label>
                  <RichTextEditor
                    value={formData.shortDescription || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortDescription: value,
                      }))
                    }
                    label="Short Description"
                    placeholder="Nhập mô tả ngắn cho sản phẩm..."
                    minHeight={160}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả chi tiết
                  </label>
                  <RichTextEditor
                    value={formData.description || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, description: value }))
                    }
                    label="Description"
                    placeholder="Nhập nội dung mô tả chi tiết sản phẩm..."
                    minHeight={280}
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
                                ? new Date(formData.saleStartDate)
                                    .toISOString()
                                    .slice(0, 16)
                                : ""
                            }
                            onChange={(e) => {
                              const dateValue = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                saleStartDate: dateValue
                                  ? new Date(dateValue).toISOString()
                                  : undefined,
                              }));
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
                              setHasSalePeriod(e.target.checked);
                              if (!e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  saleStartDate: undefined,
                                  saleEndDate: undefined,
                                }));
                              }
                            }}
                            className="w-3 h-3 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-xs text-gray-600">
                            Thời hạn
                          </span>
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
                                ? new Date(formData.saleEndDate)
                                    .toISOString()
                                    .slice(0, 16)
                                : ""
                            }
                            onChange={(e) => {
                              const dateValue = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                saleEndDate: dateValue
                                  ? new Date(dateValue).toISOString()
                                  : undefined,
                              }));
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
                <div className="text-center py-4 text-gray-500">
                  Đang tải...
                </div>
              ) : (
                <>
                  {/* Add Attribute */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddCustomSpecification}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Thêm mới
                      </button>
                      <div className="flex-1">
                        <Select
                          className="react-select-container"
                          classNamePrefix="react-select"
                          value={null}
                          onChange={(option) =>
                            handleAddAttribute(option?.value)
                          }
                          options={attributes
                            .filter(
                              (attr) =>
                                !selectedAttributes.some(
                                  (sa) => sa.attributeId === attr.id,
                                ),
                            )
                            .map((attr) => ({
                              value: attr.id,
                              label: `${attr.name} (${attr.code})`,
                            }))}
                          placeholder="Thêm hiện có"
                          isSearchable
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selected Attributes List */}
                  <div className="space-y-2">
                    {selectedAttributes.map((selectedAttr) => {
                      const attribute = attributes.find(
                        (a) => a.id === selectedAttr.attributeId,
                      );
                      if (!attribute) return null;

                      const isOpen = selectedAttr.isOpen ?? false;

                      return (
                        <div
                          key={selectedAttr.attributeId}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Dropdown Header */}
                          <div className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <button
                              type="button"
                              onClick={() =>
                                toggleAttributeDropdown(selectedAttr.attributeId)
                              }
                              className="flex flex-1 items-center gap-2 p-4 text-left"
                            >
                              {isOpen ? (
                                <ChevronUp
                                  size={20}
                                  className="text-gray-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                  className="text-gray-400"
                                />
                              )}
                              <div className="text-left">
                                <span className="font-medium text-gray-900">
                                  {attribute.name}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({attribute.code})
                                </span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(selectedAttr.attributeId)}
                              className="text-red-600 hover:text-red-700 transition-colors p-4"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* Dropdown Content */}
                          {isOpen && (
                            <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá trị{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <CreatableSelect
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    options={
                                      attributeValueOptionsByAttributeId[
                                        selectedAttr.attributeId
                                      ] || []
                                    }
                                    value={
                                      selectedAttr.value
                                        ? (
                                            attributeValueOptionsByAttributeId[
                                              selectedAttr.attributeId
                                            ] || []
                                          ).find(
                                            (opt) =>
                                              opt.value === selectedAttr.value,
                                          ) || {
                                            value: selectedAttr.value,
                                            label: selectedAttr.value,
                                            extraData: selectedAttr.extraData,
                                          }
                                        : null
                                    }
                                    onChange={(option: any) => {
                                      if (!option) {
                                        handleAttributeValueChange(
                                          selectedAttr.attributeId,
                                          "value",
                                          "",
                                        );
                                        handleAttributeValueChange(
                                          selectedAttr.attributeId,
                                          "extraData",
                                          "",
                                        );
                                        return;
                                      }
                                      handleAttributeValueChange(
                                        selectedAttr.attributeId,
                                        "value",
                                        option.value || "",
                                      );
                                      handleAttributeValueChange(
                                        selectedAttr.attributeId,
                                        "extraData",
                                        option.extraData || "",
                                      );
                                    }}
                                    onCreateOption={(inputValue) =>
                                      handleAttributeValueChange(
                                        selectedAttr.attributeId,
                                        "value",
                                        inputValue.trim(),
                                      )
                                    }
                                    placeholder="Chọn hoặc nhập giá trị"
                                    isClearable
                                    isSearchable
                                    formatCreateLabel={(inputValue) =>
                                      `Tạo mới: ${inputValue}`
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dữ liệu bổ sung (tùy chọn)
                                  </label>
                                  <input
                                    type="text"
                                    value={selectedAttr.extraData || ""}
                                    onChange={(e) =>
                                      handleAttributeValueChange(
                                        selectedAttr.attributeId,
                                        "extraData",
                                        e.target.value,
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
                      );
                    })}

                    {selectedAttributes.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        Chưa có thuộc tính nào. Hãy chọn và thêm thuộc tính ở
                        trên.
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="space-y-2">
                      {customSpecifications.map((item, idx) => (
                        <div
                          key={`custom-spec-${idx}`}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <button
                              type="button"
                              onClick={() =>
                                toggleCustomSpecificationDropdown(idx)
                              }
                              className="flex flex-1 items-center gap-2 p-4 text-left"
                            >
                              {item.isOpen ? (
                                <ChevronUp
                                  size={20}
                                  className="text-gray-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                  className="text-gray-400"
                                />
                              )}
                              <div className="text-left">
                                <span className="font-medium text-gray-900">
                                  {item.key.trim() ||
                                    `Thuộc tính custom #${idx + 1}`}
                                </span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomSpecification(idx)}
                              className="text-red-600 hover:text-red-700 transition-colors p-4"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {item.isOpen && (
                            <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên thuộc tính
                                  </label>
                                  <input
                                    type="text"
                                    value={item.key}
                                    onChange={(e) =>
                                      handleCustomSpecificationChange(
                                        idx,
                                        "key",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Nhập tên thuộc tính"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá trị
                                  </label>
                                  <input
                                    type="text"
                                    value={item.value}
                                    onChange={(e) =>
                                      handleCustomSpecificationChange(
                                        idx,
                                        "value",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Nhập giá trị"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Image Upload & Tags */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Hình ảnh bìa sản phẩm
              </h2>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg"
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
                <ImageChoser
                  onDrop={(files) => handleImageChange(files)}
                  onSelectImage={(url) => handleImageChange(url)}
                />
              )}
            </div>

            {/* Product gallery images */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Hình sản phẩm</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGalleryPickerOpen(true)}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg"
                  >
                    Thêm ảnh
                  </button>
                </div>
              </div>

              {productImages.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Chưa có ảnh nào. Thêm ảnh cho sản phẩm.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {productImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded overflow-hidden border"
                    >
                      <img
                        src={img.url || "/images/default/no-image.png"}
                        alt={img.fileName}
                        className="w-full h-full object-contain bg-gray-50"
                      />
                      <button
                        onClick={() => removeProductImage(img.id)}
                        className="absolute top-1 right-1 bg-white/90 rounded-full px-1 text-red-600 text-xs font-semibold hover:bg-white/75"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Danh mục sản phẩm</h2>
                <button
                  type="button"
                  onClick={() => setIsCategoryBoxOpen((prev) => !prev)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-500"
                >
                  {isCategoryBoxOpen ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>

              {isCategoryBoxOpen && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn danh mục cha hoặc danh mục con{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="border border-gray-200 rounded-lg">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 text-sm">
                      <button
                        type="button"
                        onClick={() => setCategoryTab("all")}
                        className={`flex-1 px-3 py-2 text-center ${
                          categoryTab === "all"
                            ? "bg-white font-medium text-gray-900 border-b-2 border-primary-500"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Tất cả danh mục
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryTab("popular")}
                        className={`flex-1 px-3 py-2 text-center ${
                          categoryTab === "popular"
                            ? "bg-white font-medium text-gray-900 border-b-2 border-primary-500"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Dùng nhiều nhất
                      </button>
                    </div>

                    {/* Category list */}
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1 bg-white">
                      {categoryOptions.length === 0 ? (
                        <div className="text-xs text-gray-500 px-1 py-2">
                          Chưa có danh mục. Hãy tạo danh mục trước.
                        </div>
                      ) : (
                        categoryOptions.map((opt) => (
                          <label
                            key={opt.id}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              name="categoryIds"
                              checked={
                                formData.categoryIds?.includes(opt.id) || false
                              }
                              onChange={() =>
                                setFormData((prev) => {
                                  const current = prev.categoryIds || [];
                                  const exists = current.includes(opt.id);
                                  const nextIds = exists
                                    ? current.filter((id) => id !== opt.id)
                                    : [...current, opt.id];
                                  return {
                                    ...prev,
                                    categoryIds: nextIds,
                                    categoryId: nextIds[0] ?? 0,
                                  };
                                })
                              }
                              className="w-4 h-4 text-primary-600 border-gray-300"
                            />
                            <span
                              className="text-gray-800"
                              style={{ paddingLeft: opt.level * 12 }}
                            >
                              {opt.label}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/categories")}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    + Thêm danh mục mới
                  </button>
                </>
              )}
            </div>

            {/* Tags Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Tag sản phẩm</h2>

              {isLoadingTags ? (
                <div className="text-center py-4 text-gray-500">
                  Đang tải...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.tag === tag.name}
                          onChange={(e) =>
                            handleTagChange(tag.name, e.target.checked)
                          }
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
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
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
            {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </form>

      {isTagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Thêm tag mới</h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsTagModalOpen(false);
                    setNewTag({ name: "", description: "" });
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
                      setNewTag((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
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
                    setIsTagModalOpen(false);
                    setNewTag({ name: "", description: "" });
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
                  {isCreatingTag ? "Đang tạo..." : "Tạo tag"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isGalleryPickerOpen && (
        <MediaPicker
          onClose={() => setIsGalleryPickerOpen(false)}
          multiSelect={true}
          onSelect={(imgs: any) => {
            if (Array.isArray(imgs)) handleAddProductImages(imgs);
            else handleAddProductImages([imgs]);
            setIsGalleryPickerOpen(false);
          }}
        />
      )}
    </div>
  );
});

export default AddProduct;
