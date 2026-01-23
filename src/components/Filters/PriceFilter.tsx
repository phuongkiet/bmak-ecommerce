import { Slider } from "@mui/material";

const PriceFilter = () => {
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
          size="small"
          defaultValue={70}
          aria-label="Small"
          valueLabelDisplay="auto"
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="">
          <h4 className="text-xs font-bold">0đ</h4>
        </div>
        <div>
          <h4 className="text-xs font-bold">5.000.000đ</h4>
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
