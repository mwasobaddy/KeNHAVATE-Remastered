import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#F8EBD5]">
            <div className="w-full">
                <div className="flex flex-col gap-2">
                    {children}
                </div>
            </div>
        </div>
    );
}