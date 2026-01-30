import { useState } from "react";
import Select, { SingleValue } from "react-select";
import { ProvinceDto } from "@/models/Province";

interface ProvinceOption {
    value: string | number;
    label: string;
}

interface ProvinceSelectProps {
    data: ProvinceDto[];
    value?: string | number | null;
    onChange?: (province: ProvinceDto | null) => void;
    isDisabled?: boolean;
    isLoading?: boolean;
}

const ProvinceSelectComponent = ({
    data,
    value,
    onChange,
    isDisabled = false,
    isLoading = false,
}: ProvinceSelectProps) => {
    const [selectedValue, setSelectedValue] = useState<ProvinceOption | null>(
        value ? { value, label: data.find((p) => p.id === value)?.name || "" } : null
    );

    const options: ProvinceOption[] = data.map((province) => ({
        value: province.id,
        label: province.name,
    }));

    const handleChange = (option: SingleValue<ProvinceOption>) => {
        setSelectedValue(option);
        if (onChange) {
            const selectedProvince = option ? data.find((p) => p.id === option.value) : null;
            onChange(selectedProvince || null);
        }
    };

    return (
        <div className="province-select-container">
            <Select
                placeholder="Chọn tỉnh/thành phố"
                isClearable
                isDisabled={isDisabled || isLoading}
                isLoading={isLoading}
                className="basic-multi-select"
                classNamePrefix="select"
                options={options}
                value={selectedValue}
                onChange={handleChange}
                noOptionsMessage={() => "Không có tỉnh/thành phố"}
            />
        </div>
    );
};

export default ProvinceSelectComponent;