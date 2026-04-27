import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center lg:grid-cols-2">
            {/* Left Side - Brand Illustration */}
            <div className="relative hidden h-full flex-col bg-black p-10 text-white lg:flex">
                <div className="absolute inset-0 bg-black dark:bg-white" />
                <div className="relative z-20 flex flex-col justify-center h-full max-w-lg">
                    <div className="mb-8">
                        <Link
                            href={home()}
                            className="relative z-20 flex items-center gap-3 font-medium"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-beige/10">
                                <AppLogoIcon className="size-6 fill-current text-[#FFF212]" />
                            </div>
                            <span className="text-xl font-semibold text-white">
                                {name}
                            </span>
                        </Link>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold leading-tight text-white">
                                KeNHA Innovation Portal
                            </h2>
                            <p className="text-lg text-gray/80 leading-relaxed">
                                Submit your innovative ideas and participate in our periodic challenges. 
                                Together, we drive healthcare innovation across Kenya.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-[#FFF212]" />
                                <span className="text-sm text-[#9B9EA4]">
                                    Submit groundbreaking ideas
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-[#FFF212]" />
                                <span className="text-sm text-[#9B9EA4]">
                                    Join innovation challenges
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-[#FFF212]" />
                                <span className="text-sm text-[#9B9EA4]">
                                    Collaborate with healthcare leaders
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-10 left-10 right-10">
                        <div className="relative h-32 overflow-hidden rounded-lg bg-white/5 dark:bg-black/5">
                            <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-yellow/20 blur-xl" />
                            <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-beige/10 blur-xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                    className="h-16 w-16 text-yellow/30"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                >
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex min-h-svh w-full flex-col items-center justify-center bg-beige dark:bg-black p-6 lg:p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
                        <Link
                            href={home()}
                            className="relative z-20 flex items-center gap-2 font-medium"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                                <AppLogoIcon className="size-6 fill-current text-[#FFF212]" />
                            </div>
                            <span className="text-xl font-semibold text-black dark:text-beige">
                                {name}
                            </span>
                        </Link>
                        <p className="text-sm text-[#9B9EA4]">
                            KeNHA Innovation Portal
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold text-black dark:text-beige">
                                {title}
                            </h1>
                            <p className="text-sm text-[#9B9EA4]">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
