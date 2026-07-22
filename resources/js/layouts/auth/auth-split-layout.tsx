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
                {/* Glow orbs */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow/5 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />

                {/* Dotted pattern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #FFF212 0.5px, transparent 0.5px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative z-20 flex h-full flex-col justify-center">
                    <div className="mb-10">
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

                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold leading-tight text-white">
                                KeNHA Innovation Portal
                            </h2>
                            <p className="text-lg text-white/40 leading-relaxed">
                                Submit your innovative ideas and participate in our innovation process. 
                                Together, we drive road infrastructure innovation across Kenya.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {[
                                'Submit groundbreaking ideas',
                                'Participate in innovation challenges',
                                'Collaborate with industry leaders',
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow/10">
                                        <svg className="h-3 w-3 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <span className="text-sm text-white/40">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-10 left-10 right-10">
                        <div className="relative h-32 overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-yellow/20 blur-xl" />
                            <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-beige/10 blur-xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                    className="h-16 w-16 text-yellow/20"
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

                    {/* Decorative ring */}
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
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
                        <p className="text-sm text-gray dark:text-gray/60">
                            KeNHA Innovation Portal
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold text-black dark:text-beige">
                                {title}
                            </h1>
                            <p className="text-sm text-gray dark:text-gray/60">
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
