import type { FilterOptionDto } from "@/models/Filter";
import { Checkbox } from "@mui/material";

interface ColorFilterProps {
  options: FilterOptionDto[];
  selectedColor?: string;
  onChange: (color: string) => void;
}

const ColorFilter = ({ options, selectedColor, onChange }: ColorFilterProps) => {
  if (options.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-bold">Màu sắc</h4>
        <p className="text-xs text-gray-400 mt-2">Không có tùy chọn</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-start items-center mb-2">
        <h4 className="text-sm font-bold">Màu sắc</h4>
      </div>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="grid grid-cols-12">
            <div className="col-span-3">
              <Checkbox
                checked={selectedColor === option.value}
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

export default ColorFilter;
