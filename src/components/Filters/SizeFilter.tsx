import { Checkbox } from "@mui/material";
import type { FilterOptionDto } from "@/models/Filter";

interface SizeFilterProps {
  options: FilterOptionDto[];
  selectedSize?: string;
  onChange: (size: string) => void;
}

const SizeFilter = ({ options, selectedSize, onChange }: SizeFilterProps) => {
  if (options.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-bold">Kích thước</h4>
        <p className="text-xs text-gray-400 mt-2">Không có tùy chọn</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-start items-center mb-2">
        <h4 className="text-sm font-bold">Kích thước</h4>
      </div>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="grid grid-cols-12">
            <div className="col-span-3">
              <Checkbox
                checked={selectedSize === option.value}
                onChange={() => onChange(option.value)}
                size="small"
              />
            </div>
            <div className="col-span-9 flex items-center justify-between">
              <div className="text-sm font-bold">{option.label}</div>
              <span className="text-xs text-gray-400">({option.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizeFilter;
