import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
}: SearchInputProps) {
    return (
        <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 pr-9"
            />
            {value.length > 0 && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
