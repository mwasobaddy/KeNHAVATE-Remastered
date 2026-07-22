import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { useEffect, useState } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();
    const [position, setPosition] = useState<'top-center' | 'top-right'>('top-right');

    useFlashToast();

    useEffect(() => {
        const check = () => {
            setPosition(window.innerWidth >= 768 ? 'top-right' : 'top-center');
        };

        check();
        window.addEventListener('resize', check);

        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position={position}
            toastOptions={{
                classNames: {
                    toast: 'border-0! shadow-lg!',
                    success: 'bg-emerald-600! text-white! border-0!',
                    error: 'bg-red-600! text-white! border-0!',
                    warning: 'bg-orange-500! text-white! border-0!',
                },
            }}
            {...props}
        />
    );
}

export { Toaster };
