import ColorSwatch from "./Color/ColorSwatch";

const ColorFilter = () => {
  return (
    <div>
      <div className="flex justify-start items-center mb-2">
        <h4 className="text-sm font-bold">Màu sắc</h4>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-12">
          <div className="col-span-3">
            <ColorSwatch color="#FF0000" />
          </div>
          <div className="col-span-9 flex items-center">
            <div className="text-sm font-bold ">Đỏ</div>
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-3">
            <ColorSwatch color="#0000FF" />
          </div>
          <div className="col-span-9 flex items-center">
            <div className="text-sm font-bold ">Xanh dương</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorFilter;
