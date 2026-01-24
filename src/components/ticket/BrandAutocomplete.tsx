import { useDataCache } from "~/hooks/useDataCache";
import { SimpleAutocomplete } from "../ui/simple-autocomplete";

interface BrandAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    id?: string;
}

export function BrandAutocomplete({ value, onChange, className, id }: BrandAutocompleteProps) {
    const { searchBrands, isLoading } = useDataCache();
    const brands = searchBrands(value);

    return (
        <SimpleAutocomplete
            id={id}
            value={value}
            onChange={onChange}
            options={brands}
            placeholder={isLoading ? "Cargando marcas..." : "Marca (ej: Toyota) *"}
            className={className}
        />
    );
}
