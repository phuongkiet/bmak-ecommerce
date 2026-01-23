import { Checkbox } from "@mui/material";

const OriginFilter = () => {
  return (
    <div>
      <div className="flex justify-start items-center mb-2">
        <h4 className="text-sm font-bold">Xuất xứ</h4>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-12">
          <div className="col-span-3">
            <Checkbox />
          </div>
          <div className="col-span-9 flex items-center">
            <div className="text-sm font-bold">Việt Nam</div>
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-3">
            <Checkbox />
          </div>
          <div className="col-span-9 flex items-center">
            <div className="text-sm font-bold ">Ấn Độ</div>
          </div>
        </div>
      </div>
    </div>
  );
}   

export default OriginFilter;