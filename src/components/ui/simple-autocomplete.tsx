import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { cn } from "~/lib/utils";

interface SimpleAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
    id?: string;
    onSelect?: (value: string) => void;
}

export function SimpleAutocomplete({
    value,
    onChange,
    options,
    placeholder,
    className,
    id,
    onSelect,
}: SimpleAutocompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter options based on input
    // Only show filtering if value is not empty, OR show all on focus if needed (let's show filtered)
    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(value.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <Input
                id={id}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
            />
            {showSuggestions && filteredOptions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-md shadow-lg py-1 text-sm left-0">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-900"
                            onClick={() => {
                                onChange(option);
                                if (onSelect) onSelect(option);
                                setShowSuggestions(false);
                            }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
