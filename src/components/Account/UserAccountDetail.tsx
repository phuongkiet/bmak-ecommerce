import { FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store";

const UserAccountDetail = observer(() => {
  const { authStore, userStore } = useStore();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(authStore.user?.fullName || "");
    setPhoneNumber(authStore.user?.phoneNumber || "");
  }, [authStore.user?.fullName, authStore.user?.phoneNumber]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authStore.user) {
      setError("Không tìm thấy thông tin tài khoản.");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await userStore.updateUser({
        id: authStore.user.id,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        roles: authStore.user.roles || [],
        isActive: true,
      });

      authStore.user = {
        ...authStore.user,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      setMessage("Cập nhật thông tin tài khoản thành công.");
    } catch {
      setError(userStore.error || "Không thể cập nhật thông tin tài khoản.");
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-4xl font-bold">Thông tin tài khoản</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="account-email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="account-email"
              value={authStore.user?.email || ""}
              disabled
              className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="account-role" className="mb-2 block text-sm font-medium text-gray-700">
              Vai trò
            </label>
            <input
              id="account-role"
              value={(authStore.user?.roles || []).join(", ") || "Khách hàng"}
              disabled
              className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="account-fullname" className="mb-2 block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              id="account-fullname"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="account-phone" className="mb-2 block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              id="account-phone"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={userStore.isLoading}
            className="rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {userStore.isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
});

export default UserAccountDetail;
