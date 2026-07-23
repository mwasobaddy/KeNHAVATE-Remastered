import { cn } from '@/lib/utils';
import { useState } from 'react';

type PhoneInputProps = {
    name: string;
    defaultValue?: string;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    onChange?: (value: string) => void;
};

export default function PhoneInput({
    name,
    defaultValue,
    disabled,
    placeholder = '712345678',
    className,
    onChange,
}: PhoneInputProps) {
    const [digits, setDigits] = useState(() => {
        const v = defaultValue ?? '';
        return v.replace(/^\+254/, '').replace(/\D/g, '').slice(0, 9);
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
        setDigits(raw);
        onChange?.(`+254${raw}`);
    };

    const fullValue = `+254${digits}`;

    return (
        <div
            className={cn(
                'flex items-stretch rounded-xl border border-input bg-white shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-yellow/30 dark:border-zinc-600 dark:bg-zinc-700/50',
                disabled && 'cursor-not-allowed opacity-50',
                className,
            )}
        >
            <span className="inline-flex items-center pl-4 pr-1 text-sm text-secondary-foreground select-none">
                +254
            </span>
            <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={digits}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className="flex h-10 w-full min-w-0 bg-transparent px-0 py-2 pr-4 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
            />
            <input type="hidden" name={name} value={fullValue} />
        </div>
    );
}
