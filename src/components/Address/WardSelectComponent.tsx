import { useState } from "react";
import Select, { SingleValue } from "react-select";
import { WardDto } from "@/models/Ward";

interface WardOption {
    value: string | number;
    label: string;
}

interface WardSelectProps {
    data: WardDto[];
    value?: string | number | null;
    onChange?: (ward: WardDto | null) => void;
    isDisabled?: boolean;
    isLoading?: boolean;
}

const WardSelectComponent = ({
    data,
    value,
    onChange,
    isDisabled = false,
    isLoading = false,
}: WardSelectProps) => {
    const [selectedValue, setSelectedValue] = useState<WardOption | null>(
        value ? { value, label: data.find((w) => w.id === value)?.name || "" } : null
    );

    const options: WardOption[] = data.map((ward) => ({
        value: ward.id,
        label: ward.name,
    }));

    const handleChange = (option: SingleValue<WardOption>) => {
        setSelectedValue(option);
        if (onChange) {
            const selectedWard = option ? data.find((w) => w.id === option.value) : null;
            onChange(selectedWard || null);
        }
    };

    return (
        <div className="ward-select-container">
            <Select
                placeholder="Chọn phường/xã/đặc khu"
                isClearable
                isDisabled={isDisabled || isLoading}
                isLoading={isLoading}
                className="basic-multi-select"
                classNamePrefix="select"
                options={options}
                value={selectedValue}
                onChange={handleChange}
                noOptionsMessage={() => "Không có phường/xã/đặc khu"}
            />
        </div>
    );
};

export default WardSelectComponent;