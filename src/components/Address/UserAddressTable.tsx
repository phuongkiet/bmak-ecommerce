import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Home, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/store";
import { AddressType, type AddressDto, type CreateAddressRequest, type UpdateAddressRequest } from "@/models/Address";
import ProvinceSelectComponent from "@/components/Address/ProvinceSelectComponent";
import WardSelectComponent from "@/components/Address/WardSelectComponent";
import type { WardDto } from "@/models/Ward";
import { getWardsByProvinceId } from "@/agent/api/wardApi";

const addressTypeOptions: Array<{ value: AddressType; label: string }> = [
  { value: AddressType.Home, label: "Nhà riêng" },
  { value: AddressType.ConstructionSite, label: "Công trình" },
  { value: AddressType.Warehouse, label: "Kho của khách" },
];

type ModalMode = "create" | "edit";

const getAddressTypeLabel = (type: AddressType): string => {
  return addressTypeOptions.find((option) => option.value === type)?.label || "Địa chỉ";
};

const UserAddressTable = observer(() => {
  const { authStore, addressStore, provinceStore } = useStore();

  const [formData, setFormData] = useState<CreateAddressRequest>({
    receiverName: "",
    phone: "",
    street: "",
    lat: "",
    lng: "",
    provinceId: "",
    wardId: "",
    type: AddressType.Home,
  });
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formWards, setFormWards] = useState<WardDto[]>([]);

  const userDefaultReceiver = useMemo(() => authStore.user?.fullName || "", [authStore.user?.fullName]);
  const userDefaultPhone = useMemo(() => authStore.user?.phoneNumber || "", [authStore.user?.phoneNumber]);

  useEffect(() => {
    if (!authStore.isAuthenticated) return;
    void addressStore.fetchMyAddresses();
  }, [authStore.isAuthenticated, addressStore]);

  useEffect(() => {
    void provinceStore.fetchProvinces();
  }, [provinceStore]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      receiverName: prev.receiverName || userDefaultReceiver,
      phone: prev.phone || userDefaultPhone,
    }));
  }, [userDefaultReceiver, userDefaultPhone]);

  useEffect(() => {
    if (!isModalOpen || !formData.provinceId) {
      setFormWards([]);
      return;
    }

    const loadWardsForForm = async () => {
      const wards = await getWardsByProvinceId(formData.provinceId);
      setFormWards(wards);
    };

    void loadWardsForForm();
  }, [formData.provinceId, isModalOpen]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingAddressId(null);
    setFormData({
      receiverName: userDefaultReceiver,
      phone: userDefaultPhone,
      street: "",
      lat: "",
      lng: "",
      provinceId: "",
      wardId: "",
      type: AddressType.Home,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (address: AddressDto) => {
    setModalMode("edit");
    setEditingAddressId(address.id);
    setFormData({
      receiverName: address.receiverName,
      phone: address.phone,
      street: address.street,
      lat: address.lat || "",
      lng: address.lng || "",
      provinceId: address.provinceId,
      wardId: address.wardId,
      type: address.type,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddressId(null);
    setFormWards([]);
  };

  const handleRemove = async (id: number) => {
    void addressStore.deleteAddress(id);
  };

  const handleSubmitModal = async () => {
    if (modalMode === "create") {
      const newId = await addressStore.createAddress(formData);
      if (!newId) return;
      closeModal();
      return;
    }

    if (!editingAddressId) return;

    const payload: UpdateAddressRequest = {
      id: editingAddressId,
      ...formData,
    };

    const success = await addressStore.updateAddress(payload);
    if (success) {
      closeModal();
    }
  };

  if (!authStore.isAuthenticated) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
        Bạn cần đăng nhập để quản lý địa chỉ.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-4xl font-bold">Địa chỉ của bạn</h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-md border border-primary-500 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
        >
          <Plus size={16} />
          Thêm mới
        </button>
      </div>

      {addressStore.error && <p className="mb-4 text-sm text-red-600">{addressStore.error}</p>}

      {addressStore.isLoading && addressStore.addresses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
          Đang tải địa chỉ...
        </div>
      ) : addressStore.addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <MapPin className="mx-auto mb-3 text-gray-400" size={30} />
          <p className="text-gray-600">Bạn chưa có địa chỉ giao hàng nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {addressStore.addresses.map((address) => (
            <div key={address.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Home size={18} className="text-gray-500" />
                  <p className="font-semibold text-gray-900">Địa chỉ nhận hàng</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(address)}
                    className="inline-flex items-center gap-1 rounded-md border border-primary-500 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
                  >
                    <Pencil size={14} />
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(address.id)}
                    className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Xóa địa chỉ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={address.receiverName}
                  readOnly
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800"
                />
                <input
                  value={address.phone}
                  readOnly
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800"
                />
                <div className="md:col-span-2">
                  <input
                    value={`${getAddressTypeLabel(address.type)}: ${address.street}, ${address.wardName}, ${address.provinceName}`}
                    readOnly
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium text-gray-700"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === "create" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={formData.receiverName}
                onChange={(event) => setFormData((prev) => ({ ...prev, receiverName: event.target.value }))}
                placeholder="Họ và tên người nhận"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
              <input
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Số điện thoại"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />

              <ProvinceSelectComponent
                data={provinceStore.provinces}
                value={formData.provinceId || null}
                onChange={(province) => {
                  const provinceId = province?.id || "";
                  setFormData((prev) => ({ ...prev, provinceId, wardId: "" }));
                }}
                isLoading={provinceStore.isLoading}
              />
              <WardSelectComponent
                data={formWards}
                value={formData.wardId || null}
                onChange={(ward) => setFormData((prev) => ({ ...prev, wardId: ward?.id || "" }))}
                isDisabled={!formData.provinceId}
              />

              <select
                value={formData.type}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, type: Number(event.target.value) as AddressType }))
                }
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              >
                {addressTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="md:col-span-2">
                <input
                  type="text"
                  value={formData.street}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      street: event.target.value,
                    }))
                  }
                  placeholder="Nhập số nhà/tên đường"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitModal()}
                disabled={addressStore.isLoading}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {addressStore.isLoading ? "Đang lưu..." : modalMode === "create" ? "Tạo địa chỉ" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default UserAddressTable;
