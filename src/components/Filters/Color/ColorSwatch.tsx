interface ColorSwatchProps {
  color: string;      // Mã màu (hex, rgb, hoặc tên màu)
  isSelected?: boolean; // Trạng thái có đang được chọn không
  onClick?: () => void; // Hàm xử lý khi click
}

const ColorSwatch = ({ color, isSelected = false, onClick }: ColorSwatchProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        w-8 h-8               
        rounded-full          
        cursor-pointer        
        border border-gray-200 
        transition-all duration-200 ease-in-out 
        
        ${isSelected 
            ? 'ring-2 ring-offset-2 ring-primary-600 scale-110' // Nếu chọn: Có vòng ring bên ngoài
            : 'hover:scale-110 hover:shadow-md'                 // Nếu chưa chọn: Hover sẽ phóng to nhẹ
        }
      `}
      // Inline style để render màu động
      style={{ backgroundColor: color }}
    />
  )
}

export default ColorSwatch;