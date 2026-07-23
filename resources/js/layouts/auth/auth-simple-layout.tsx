import { Link } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';

export default function AuthSimpleLayout({
    children,
    name,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-beige p-6 dark:bg-zinc-900">
            <Link
                href={home()}
                className="flex flex-col items-center gap-3 self-center font-medium"
            >
                <div className="flex h-18 w-18 items-center justify-center rounded-full border-2 border-black bg-white shadow-[0_0_20px_rgba(255,242,0,0.3)] dark:border-yellow dark:bg-zinc-800">
                    <img
                        src="/img/logo-icon.webp"
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <span className="text-xl font-semibold text-black dark:text-beige">
                    {name}
                </span>
            </Link>
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}