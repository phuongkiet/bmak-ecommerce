import { observer } from "mobx-react-lite";
import { useStore } from "@/store";

const CustomerFooter = observer(() => {
  const { adminSettingStore } = useStore();
  const siteName = adminSettingStore.setting?.siteName?.trim() || "GAVICO";
  const companyName =
    adminSettingStore.setting?.companyName?.trim() || siteName;
  const hotline = adminSettingStore.setting?.hotline?.trim() || "1900xxxx";
  const hotlineHref = `tel:${hotline.replace(/\s+/g, "")}`;

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{siteName}</h3>
            <ul className="text-gray-400 font-semibold">
              <li>{adminSettingStore.setting?.companyName}</li>

              <li>
                {adminSettingStore.setting?.businessAddress
                  ? `Địa chỉ: ${adminSettingStore.setting.businessAddress}`
                  : ""}
              </li>
              <li>
                {adminSettingStore.setting?.taxCode
                  ? `MST: ${adminSettingStore.setting.taxCode}`
                  : ""}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="/news/privacy-policy" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="/news/terms-of-service" className="hover:text-white transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href={hotlineHref} className="hover:text-white transition-colors">
                  Hotline: {hotline}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2025 - {new Date().getFullYear()} {companyName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default CustomerFooter;
