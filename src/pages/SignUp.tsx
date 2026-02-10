import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store";
import { useNavigate } from "react-router-dom";
import * as authApi from "@/agent/api/authApi";

const SignUp = observer(() => {
  const { authStore, commonStore } = useStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      authStore.isLoading = true;
      // backend expects RegisterRequest: { fullName, phoneNumber, email, password, confirmPassword }
      const registerPayload = {
        fullName,
        phoneNumber,
        email,
        password,
        confirmPassword,
      };

      const registerResult = await authApi.register(registerPayload);

      // registerResult may be a token string or ApiResponse<string>, or backend might return AuthResponse
      let token: string | undefined;
      let authResp: any = null;

      if (registerResult) {
        if (typeof registerResult === "string") {
          token = registerResult;
        } else if (
          "value" in registerResult &&
          typeof registerResult.value === "string"
        ) {
          token = registerResult.value;
        } else if ((registerResult as any).token) {
          authResp = registerResult;
          token = (registerResult as any).token;
        }
      }

      if (token) {
        commonStore.setToken(token);
        // if register returned refresh token, set it
        if ((registerResult as any)?.refreshToken) {
          commonStore.setRefreshToken((registerResult as any).refreshToken);
        }
        // get user info via login (or backend may have returned authResp)
        if (!authResp) {
          const loginResp = await authApi.login(email, password);
          authResp = "value" in loginResp ? loginResp.value : loginResp;
        }

        if (authResp) {
          authStore.user = {
            id: authResp.id,
            fullName: authResp.fullName || authResp.name || "",
            email: authResp.email,
            phoneNumber: authResp.phoneNumber || "",
            roles: authResp.roles || [],
            token: authResp.token,
            refreshToken: authResp.refreshToken,
          };
          if (authResp.refreshToken) {
            commonStore.setRefreshToken(authResp.refreshToken);
          }
          authStore.isAuthenticated = true;
          localStorage.setItem("user", JSON.stringify(authStore.user));
          localStorage.setItem("isAuthenticated", "true");
        }

        navigate("/");
      } else {
        setError("Đăng ký không thành công");
      }
    } catch (err: any) {
      setError(err?.message || "Đăng ký thất bại");
    } finally {
      authStore.isLoading = false;
    }
  };

  return (
    <div className="my-20 flex flex-col items-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng ký</h1>

        {(error || authStore.error) && (
          <div className="mb-4 text-sm text-red-600">
            {error || authStore.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              placeholder="Nhập đầy đủ họ và tên của bạn..."
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              placeholder="Nhập số điện thoại của bạn..."
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              placeholder="Nhập mật khẩu của bạn..."
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              placeholder="Vui lòng nhập lại mật khẩu để xác nhận..."
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={authStore.isLoading}
            className="w-full bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700 disabled:opacity-60"
          >
            {authStore.isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="mt-4 text-sm text-center">
            Đã có tài khoản?{" "}
            <a href="/sign-in" className="text-primary-600 hover:underline">
              Đăng nhập ngay
            </a>
          </span>
        </div>
      </div>
    </div>
  );
});

export default SignUp;
