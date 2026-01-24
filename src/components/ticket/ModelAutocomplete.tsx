import { useDataCache } from "~/hooks/useDataCache";
import { SimpleAutocomplete } from "../ui/simple-autocomplete";

interface ModelAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    brandName?: string;
    className?: string;
    id?: string;
}

export function ModelAutocomplete({ value, onChange, brandName, className, id }: ModelAutocompleteProps) {
    const { searchModels, isLoading } = useDataCache();

    // Pass brandName to filter models by brand if selected
    const models = searchModels(value, brandName);

    return (
        <SimpleAutocomplete
            id={id}
            value={value}
            onChange={onChange}
            options={models}
            placeholder={isLoading ? "Cargando modelos..." : "Modelo (ej: Corolla) *"}
            className={className}
        />
    );
}
