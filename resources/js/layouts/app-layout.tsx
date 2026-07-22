import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
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
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <Toaster />
        </AppLayoutTemplate>
    );
}
