import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useFlashToast } from '@/hooks/use-flash-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    useFlashToast();

    useEffect(() => {
        const unsub = router.on('httpException', (event) => {
            const status = (event.detail as { status?: number }).status;

            if (status === 419) {
                toast.error('Session expired. Please log in again.');
            } else if (status === 403) {
                event.preventDefault();
                toast.error('You do not have permission to perform this action.');
            }
        });

        return () => unsub();
    }, []);

    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
