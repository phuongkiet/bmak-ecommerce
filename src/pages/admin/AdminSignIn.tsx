import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store";
import { useNavigate } from "react-router-dom";

const AdminSignIn = observer(() => {
  const { authStore } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await authStore.login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      // error is handled in store; nothing more to do here
    }
  };

  // trigger shake animation when authStore.error changes
  useEffect(() => {
    if (authStore.error) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 700);
      return () => clearTimeout(t);
    }
  }, [authStore.error]);

  return (
    <div className="my-20 flex flex-col items-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Địa chỉ email
            </label>
            <input
              type="email"
              value={email}
              placeholder="Nhập địa chỉ email của bạn..."
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu của bạn..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={authStore.isLoading}
            className="w-full bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {authStore.isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {authStore.error && (
          <div className={`mt-4 border border-red-400 bg-red-100 p-3 rounded ${shake ? 'animate-shake' : ''}`}>
            <div className="flex items-start justify-center">
              <div className="text-md text-red-600 font-semibold text-center">
                {authStore.error}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="mt-4 text-sm text-center">
            Chưa có tài khoản?{" "}
            <a href="/sign-up" className="text-primary-600 hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
});

export default AdminSignIn;
