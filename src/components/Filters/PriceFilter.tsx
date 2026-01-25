import { Slider } from "@mui/material";
import { useEffect, useState } from "react";

interface PriceFilterProps {
  min: number;
  max: number;
  onChange: (range: number[]) => void;
}

const PriceFilter = ({ min, max, onChange }: PriceFilterProps) => {
  const [value, setValue] = useState<number[]>([min, max]);

  useEffect(() => {
    // Chỉ update khi min/max hợp lệ (không phải 0/0)
    if (min > 0 || max > 0) {
      setValue([min, max]);
    }
  }, [min, max]);
  
  // Nếu chưa có data từ backend, không hiển thị
  if (min === 0 && max === 0) {
    return (
      <div className="w-full">
        <h4 className="text-sm font-bold">Giá</h4>
        <p className="text-xs text-gray-400 mt-2">Đang tải...</p>
      </div>
    );
  }

  const handleChange = (_event: Event, newValue: number | number[]) => {
    setValue(newValue as number[]);
  };

  const handleChangeCommitted = (
    _event: Event | React.SyntheticEvent,
    newValue: number | number[],
  ) => {
    // Chỉ gọi API filter khi người dùng đã kéo xong
    onChange(newValue as number[]);
  };
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <div className="">
          <h4 className="text-sm font-bold">Giá</h4>
        </div>
        <div>
          <span className="text-2xl font-bold text-gray-600">-</span>
        </div>
      </div>
      <div>
        <Slider
          getAriaLabel={() => "Khoảng giá"}
          value={value}
          min={min} // Dùng min dynamic
          max={max} // Dùng max dynamic
          onChange={handleChange}
          onChangeCommitted={handleChangeCommitted}
          valueLabelDisplay="auto"
          size="small"
          sx={{ color: '#primary-color-hex' }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs font-medium text-gray-500">{min.toLocaleString('vi-VN')}đ</span>
        <span className="text-xs font-medium text-gray-500">{max.toLocaleString('vi-VN')}đ</span>
      </div>
    </div>
  );
};

export default PriceFilter;
