import { useMemo, useState } from "react";
import type { ProductDto } from "@/models/Product";
import { proxyImageSourcesInHtml } from "@/utils/imageProxy";

interface ProductExtraInfoTabsProps {
  product: ProductDto;
}

type TabKey = "extra" | "description" | "reviews";

const ProductExtraInfoTabs = ({ product }: ProductExtraInfoTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("extra");

  const getAttributeValue = (names: string[], codes: string[] = []) => {
    const byName = product.attributes?.find((attr) => names.includes(attr.name));
    if (byName?.value) return byName.value;

    const byCode = product.attributes?.find((attr) =>
      codes.some((code) => attr.code?.toUpperCase() === code.toUpperCase()),
    );
    return byCode?.value;
  };

  const sizeValue = useMemo(() => {
    const fromAttribute = getAttributeValue(["Kích thước", "Kích cỡ"], ["SIZE"]);
    if (fromAttribute) return fromAttribute;

    if (product.width && product.height) {
      return `${product.width} × ${product.height} cm`;
    }

    return undefined;
  }, [product]);

  const extraRows = useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [];

    if (product.weight) rows.push({ label: "Trọng lượng", value: `${product.weight} kg` });
    if (sizeValue) rows.push({ label: "Kích thước", value: sizeValue });

    const surface = getAttributeValue(["Bề mặt"], ["SURFACE", "FINISH", "TEXTURE"]);
    if (surface) rows.push({ label: "Bề mặt", value: surface });

    const material = getAttributeValue(["Chất liệu"], ["MATERIAL"]);
    if (material) rows.push({ label: "Chất liệu", value: material });

    const origin = getAttributeValue(["Xuất xứ"], ["ORIGIN", "BRAND"]);
    if (origin) rows.push({ label: "Xuất xứ", value: origin });

    const color = getAttributeValue(["Màu sắc"], ["COLOR"]);
    if (color) rows.push({ label: "Màu sắc", value: color });

    if (product.priceUnit) rows.push({ label: "Đơn vị", value: product.priceUnit });

    return rows;
  }, [product, sizeValue]);

  return (
    <div className="mt-10">
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-10 text-4">
          <button
            type="button"
            onClick={() => setActiveTab("extra")}
            className={`pb-3 font-semibold uppercase ${
              activeTab === "extra"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Thông tin bổ sung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`pb-3 font-semibold uppercase ${
              activeTab === "description"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mô tả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 font-semibold uppercase ${
              activeTab === "reviews"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Đánh giá (0)
          </button>
        </div>
      </div>

      <div className="pt-6">
        {activeTab === "extra" && (
          <div className="border border-gray-200">
            {extraRows.length === 0 ? (
              <div className="px-4 py-6 text-gray-500">Không có thông tin bổ sung</div>
            ) : (
              extraRows.map((row, index) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-2 border-b border-gray-200 last:border-b-0 ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <div className="px-4 py-4 font-semibold text-gray-600">{row.label}</div>
                  <div className="px-4 py-4 text-gray-600">{row.value}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "description" && (
          product.description ? (
            <div
              className="px-1 py-2 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: proxyImageSourcesInHtml(product.description) }}
            />
          ) : (
            <div className="px-1 py-2 text-gray-600">Chưa có mô tả</div>
          )
        )}

        {activeTab === "reviews" && (
          <div className="px-1 py-2 text-gray-500">Chưa có đánh giá nào.</div>
        )}
      </div>
    </div>
  );
};

export default ProductExtraInfoTabs;
