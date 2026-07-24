import { createInertiaApp, router } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import GuestLayout from '@/layouts/guest-layout';
import RootLayout from '@/layouts/root-layout';


router.on('navigate', () => {
    document.body.style.removeProperty('pointer-events');
});

const appName = import.meta.env.VITE_APP_NAME || 'KeNHAVATE - KeNHA\'s Innovation Portal';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('public/'):
                return [RootLayout, GuestLayout];
            case name === 'welcome':
                return RootLayout;
            case name.startsWith('auth/'):
                return [RootLayout, AuthLayout];
            case name.startsWith('settings/'):
                return [RootLayout, AppLayout];
            default:
                return [RootLayout, AppLayout];
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
