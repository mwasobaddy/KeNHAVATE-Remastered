import { Link, usePage } from '@inertiajs/react';
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
                {/* Gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/95 to-[#231F20]/80" />

                {/* Hero background image */}
                <div
                    className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: "url('/img/hero1.webp')" }}
                />

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

                <div className="relative z-10 flex h-full flex-col justify-center">
                    {/* Headline */}
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold leading-tight text-white">
                            Innovation Revolutionizing the way we{' '}
                            <span className="text-[#FFF200] [text-shadow:0_0_20px_rgba(255,242,0,0.3)]">
                                create, collaborate, and experience
                            </span>{' '}
                            solutions.
                        </h1>
                        <p className="mt-6 text-lg leading-relaxed text-white/60">
                            Streamline innovation management with AI-powered insights, collaborative
                            workflows, and data-driven decision making.
                        </p>
                    </div>

                    {/* 3D Geometric Floating Cubes */}
                    <div className="absolute right-0 top-1/2 w-72 -translate-y-1/2 h-60">
                        {/* Large cube — yellow */}
                        <div
                            className="absolute left-8 top-0 h-20 w-20 rounded-lg border border-yellow/20 bg-yellow/5"
                            style={{ animation: 'float 6s ease-in-out infinite' }}
                        >
                            <div className="absolute inset-2 rounded-md bg-beige/10" />
                        </div>

                        {/* Medium cube — gray */}
                        <div
                            className="absolute right-4 top-12 h-16 w-16 rounded-lg border border-gray/30 bg-gray/5"
                            style={{ animation: 'float 6s ease-in-out infinite 1s' }}
                        >
                            <div className="absolute inset-2 rounded-md bg-yellow/10" />
                        </div>

                        {/* Small cube — dark */}
                        <div
                            className="absolute bottom-8 left-16 h-12 w-12 rounded-lg border border-white/10 bg-white/5"
                            style={{ animation: 'float 6s ease-in-out infinite 2s' }}
                        />

                        {/* Connecting lines */}
                        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 288 240">
                            <line x1="60" y1="40" x2="200" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
                            <line x1="200" y1="80" x2="80" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,4" />
                        </svg>
                    </div>

                    {/* Status indicator */}
                    <div className="mt-auto flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow/10">
                            <div
                                className="h-5 w-5 rounded-full bg-[#FFF200] shadow-lg shadow-yellow/40"
                                style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
                            />
                        </div>
                        <div>
                            <div className="font-medium text-white">Innovating</div>
                            <div className="text-sm text-white/40">Connecting ideas with impact</div>
                        </div>
                    </div>
                </div>

                {/* Decorative ring */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
            </div>

            {/* Right Side - Form */}
            <div className="flex min-h-svh w-full flex-col items-center justify-center bg-white p-6 dark:bg-zinc-800 lg:p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8 flex flex-col items-center gap-2">
                        <Link
                            href={home()}
                            className="relative z-20 flex flex-col items-center gap-3 font-medium"
                        >
                            <div className="flex h-18 w-18 items-center justify-center rounded-full border-2 border-black bg-white shadow-[0_0_20px_rgba(255,242,0,0.3)] dark:border-yellow dark:bg-zinc-800">
                                <img
                                    src="/img/logo-icon.webp"
                                    alt={name}
                                    className="size-6 fill-current text-[#231F20] dark:text-zinc-900 hover:scale-105 transition-transform duration-300 ease-in-out h-full w-full object-cover"
                                />
                            </div>
                            <span className="text-xl font-semibold text-black dark:text-beige">
                                {name}
                            </span>
                        </Link>
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
