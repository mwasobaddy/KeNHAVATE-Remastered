import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { login } from '@/routes';

interface Props {
    stats: {
        totalIdeas: number;
        implemented: number;
        collaborators: number;
    };
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const step = Math.max(1, Math.floor(value / 60));
        const interval = setInterval(() => {
            start += step;

            if (start >= value) {
                setDisplayed(value);
                clearInterval(interval);
            } else {
                setDisplayed(start);
            }
        }, duration / 60);

        return () => clearInterval(interval);
    }, [value]);

    return <>{displayed.toLocaleString()}{suffix}</>;
}

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(el);
                }
            },
            { threshold },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

export default function Home({ stats }: Props) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="Welcome" />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
                    50% { transform: translateY(-12px) rotate(var(--r, 0deg)); }
                }
                @keyframes pulse-dot {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.4); opacity: 1; }
                }
                @keyframes drift {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -20px) rotate(5deg); }
                    66% { transform: translate(-15px, 10px) rotate(-3deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes slide-up {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes draw-line {
                    0% { width: 0; }
                    100% { width: 100%; }
                }
                .reveal {
                    opacity: 0; transform: translateY(30px); transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal.in {
                    opacity: 1; transform: translateY(0);
                }
                .reveal-delay-1 { transition-delay: 0.1s; }
                .reveal-delay-2 { transition-delay: 0.2s; }
                .reveal-delay-3 { transition-delay: 0.3s; }
                .reveal-delay-4 { transition-delay: 0.4s; }
                .reveal-delay-5 { transition-delay: 0.5s; }
            `}</style>

            {/* ─── HERO ─── */}
            <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-black via-black/95 to-black">
                {/* Ambient glow orbs */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow/5 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />
                <div className="pointer-events-none absolute left-1/3 top-1/4 h-2 w-2 rounded-full bg-yellow/60" style={{ animation: 'pulse-dot 3s ease-in-out infinite' }} />

                {/* Dotted grid pattern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #FFF212 0.5px, transparent 0.5px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Decorative diagonal line */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow/30 to-transparent" />

                <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 pb-20 pt-24 sm:px-6 lg:px-8">
                    {/* Floating stat badges — desktop only decorative */}
                    {/* <div className="pointer-events-none absolute right-[15%] top-28 hidden flex-col items-end gap-3 lg:flex">
                        <div
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-right backdrop-blur-xl"
                            style={{ animation: 'float 6s ease-in-out infinite', '--r': '2deg' } as React.CSSProperties}
                        >
                            <p className="text-lg font-bold text-yellow">{stats.implemented}</p>
                            <p className="text-[10px] font-medium tracking-wider text-white/40 uppercase">Implemented</p>
                        </div>
                        <div
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-right backdrop-blur-xl"
                            style={{ animation: 'float 8s ease-in-out 1s infinite', '--r': '-1deg' } as React.CSSProperties}
                        >
                            <p className="text-lg font-bold text-emerald-400">{stats.collaborators}+</p>
                            <p className="text-[10px] font-medium tracking-wider text-white/40 uppercase">Collaborators</p>
                        </div>
                    </div> */}

                    <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
                        {/* Left: Text */}
                        <div className="lg:col-span-3">
                            <div className="reveal in">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wider text-white/50 uppercase backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
                                    Kenya National Highways Authority
                                </span>
                            </div>

                            <h1 className="reveal in reveal-delay-1 mt-8 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                                <span className="text-white/90">Innovations @</span>
                                <br />
                                <span className="bg-gradient-to-r from-yellow via-amber-300 to-yellow bg-clip-text text-transparent">
                                    KeNHA
                                </span>
                            </h1>

                            <p className="reveal in reveal-delay-2 mt-5 max-w-lg text-base leading-relaxed text-white/50 sm:text-lg">
                                Have an idea to improve Kenya's road infrastructure? Submit it here,
                                collaborate with colleagues, and see it come to life.
                            </p>

                            <div className="reveal in reveal-delay-3 mt-8 flex flex-wrap items-center gap-4">
                                <Link
                                    href={login()}
                                    className="group inline-flex items-center gap-2 rounded-full bg-yellow px-7 py-3.5 text-sm font-semibold text-black shadow-lg shadow-yellow/20 transition-all hover:bg-yellow/90 hover:shadow-xl hover:shadow-yellow/25 active:scale-[0.97]"
                                >
                                    <span>Submit Your Idea</span>
                                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/explore"
                                    className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                    Browse Ideas
                                </Link>
                            </div>
                        </div>

                        {/* Right: Floating image */}
                        <div className="relative lg:col-span-2">
                            {/* Decorative shapes */}
                            <div
                                className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 rounded-2xl border-2 border-yellow/20"
                                style={{ animation: 'drift 12s ease-in-out infinite' }}
                            />
                            <div
                                className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl border-2 border-amber-500/20"
                                style={{ animation: 'drift 10s ease-in-out 2s infinite reverse' }}
                            />

                            {/* Dots cluster */}
                            <div className="pointer-events-none absolute -right-8 top-12 hidden gap-2 lg:grid grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-1.5 w-1.5 rounded-full bg-yellow/40"
                                        style={{ animation: `pulse-dot ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }}
                                    />
                                ))}
                            </div>

                            {/* Image frame */}
                            <div
                                className="group relative"
                                style={{ animation: 'float 7s ease-in-out infinite', '--r': '2.5deg' } as React.CSSProperties}
                            >
                                {/* Shadow layer */}
                                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-yellow/10 via-transparent to-amber-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                                {/* Polaroid frame */}
                                <div className="relative rounded-2xl bg-white p-2.5 shadow-2xl shadow-black/40 transition-transform duration-500 hover:rotate-0 sm:p-3">
                                    <img
                                        src="/img/hero.webp"
                                        alt="KeNHA innovation — roads and people building the future"
                                        className="rounded-xl"
                                    />

                                    {/* Bottom caption strip */}
                                    <div className="flex items-center justify-between px-2 py-3 sm:px-3">
                                        <span className="text-[11px] font-semibold tracking-wider text-black/60 uppercase">
                                            KeNHAVATE
                                        </span>
                                        <span className="text-[10px] text-black/30">
                                            Innovation Portal
                                        </span>
                                    </div>
                                </div>

                                {/* Corner decoration */}
                                <div className="pointer-events-none absolute -top-3 -right-3 h-8 w-8 border-t-2 border-r-2 border-yellow/40 rounded-tr-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div
                    className={`absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-700 ${scrolled ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-medium tracking-widest text-white/30 uppercase">Scroll</span>
                        <svg className="h-4 w-4 animate-bounce text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* ─── MARQUEE DIVIDER ─── */}
            <div className="relative overflow-hidden bg-yellow py-3">
                <div className="flex whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite' }}>
                    <span className="mx-8 text-sm font-semibold tracking-widest text-black/60 uppercase">
                        Innovation · Collaboration · Impact · Ideas in Motion · Kenya's Road Future ·
                    </span>
                    <span className="mx-8 text-sm font-semibold tracking-widest text-black/60 uppercase">
                        Innovation · Collaboration · Impact · Ideas in Motion · Kenya's Road Future ·
                    </span>
                </div>
            </div>

            {/* ─── HOW IT WORKS (broken grid) ─── */}
            <Section>
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full bg-yellow/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-yellow-700 uppercase dark:text-yellow-300">
                        How It Works
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        From idea to <span className="px-4 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-black dark:before:bg-white relative inline-block"><span className="relative text-yellow dark:text-black">impact</span></span>
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                        Every great road improvement starts with a single idea. Here's how yours makes a difference.
                    </p>
                </div>

                <div className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
                    {/* Step 1 — offset up */}
                    <div className="reveal in reveal-delay-1 md:-mt-6">
                        <StepCard
                            number="01"
                            title="Submit"
                            description="Share your idea with a clear description, problem statement, and proposed solution."
                            color="bg-yellow text-black"
                            border="border-yellow/30"
                        />
                    </div>

                    {/* Step 2 — center */}
                    <div className="reveal in reveal-delay-2 md:mt-4">
                        <StepCard
                            number="02"
                            title="Review"
                            description="Your idea is reviewed, classified, and evaluated by the relevant officers."
                            color="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                            border="border-amber-200/50 dark:border-amber-800/30"
                        />
                    </div>

                    {/* Step 3 — offset up */}
                    <div className="reveal in reveal-delay-3 md:-mt-3">
                        <StepCard
                            number="03"
                            title="Implement"
                            description="Approved ideas are budgeted, implemented, and tracked to completion."
                            color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            border="border-emerald-200/50 dark:border-emerald-800/30"
                        />
                    </div>
                </div>

                {/* Connecting dotted line (desktop only) */}
                <div className="pointer-events-none absolute left-1/2 top-0 hidden h-px w-2/3 -translate-x-1/2 border-t-2 border-dashed border-yellow/20 md:block" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }} />
            </Section>

            {/* ─── STATS BANNER ─── */}
            <section className="relative overflow-hidden bg-black py-16">
                <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-yellow/5 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-amber-500/5 blur-[80px]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-3">
                        {[
                            { value: stats.totalIdeas, label: 'Ideas Submitted', accent: 'text-yellow' },
                            { value: stats.implemented, label: 'Ideas Implemented', accent: 'text-emerald-400' },
                            { value: stats.collaborators, label: 'Active Collaborators', suffix: '+', accent: 'text-amber-400' },
                        ].map((stat, i) => (
                            <div key={stat.label} className="reveal in" style={{ transitionDelay: `${0.1 + i * 0.12}s` }}>
                                <StatCard
                                    value={stat.value}
                                    label={stat.label}
                                    suffix={stat.suffix ?? ''}
                                    accent={stat.accent}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-black to-background py-24 lg:py-32">
                {/* Decorative ring */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 dark:border-white/10" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/5 dark:border-white/5" />

                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="reveal in">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wider text-white/40 uppercase backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
                            Get Involved
                        </span>
                    </div>

                    <h2 className="reveal in reveal-delay-1 mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Ready to make a difference?
                    </h2>

                    <p className="reveal in reveal-delay-2 mx-auto mt-4 max-w-lg text-base text-white/40">
                        Join your colleagues in shaping the future of Kenya's road infrastructure. Every idea counts.
                    </p>

                    <div className="reveal in reveal-delay-3 mt-8">
                        <Link
                            href={login()}
                            className="group inline-flex items-center gap-2 rounded-full bg-yellow px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-yellow/20 transition-all hover:bg-yellow/90 hover:shadow-xl hover:shadow-yellow/25 active:scale-[0.97]"
                        >
                            <span>Get Started</span>
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

/* ─── Sub-components ─── */

function Section({ children }: { children: React.ReactNode }) {
    const { ref, inView } = useInView();

    return (
        <section ref={ref} className="relative overflow-hidden py-20 lg:py-28">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-beige)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(248,235,213,0.03)_0%,_transparent_70%)]" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28">
                {children}
            </div>
            {inView && <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-yellow/20 to-transparent" style={{ animation: 'draw-line 1s ease-out forwards' }} />}
        </section>
    );
}

function StepCard({
    number,
    title,
    description,
    color,
    border,
}: {
    number: string;
    title: string;
    description: string;
    color: string;
    border: string;
}) {
    const { ref, inView } = useInView();

    return (
        <div
            ref={ref}
            className={`group relative overflow-hidden rounded-2xl border ${border} bg-card/50 p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl`}
        >
            {/* Hover glow */}
            <div className="pointer-events-none absolute -inset-20 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{
                background: 'radial-gradient(circle at 50% 0%, var(--color-yellow) 0%, transparent 60%)',
            }} />

            <div className={`relative z-10 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold ${color}`}>
                {number}
            </div>
            <h3 className="relative z-10 text-xl font-semibold">{title}</h3>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>
            {inView && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-yellow/40 transition-all duration-700" style={{ width: `${inView ? '100%' : '0%'}` }} />
            )}
        </div>
    );
}

function StatCard({
    value,
    label,
    suffix,
    accent,
}: {
    value: number;
    label: string;
    suffix: string;
    accent: string;
}) {
    const { ref, inView } = useInView();

    return (
        <div
            ref={ref}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-8 text-center transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05]"
        >
            <p className={`text-4xl font-bold tracking-tight sm:text-5xl ${accent} ${inView ? '' : 'opacity-0'}`}>
                {inView ? <AnimatedCounter value={value} suffix={suffix} /> : '0'}
            </p>
            <p className="mt-2 text-xs font-medium tracking-wider text-white/40 uppercase">
                {label}
            </p>
        </div>
    );
}
