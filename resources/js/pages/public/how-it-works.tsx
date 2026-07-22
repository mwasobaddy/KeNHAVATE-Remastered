import { Head, Link } from '@inertiajs/react';
import { login } from '@/routes';

const steps = [
    {
        number: '01',
        title: 'Submit Your Idea',
        description: 'Fill out a simple form with your idea title, description, problem statement, and proposed solution. You can also attach supporting documents.',
        details: [
            'Provide a clear and concise title',
            'Describe the problem you want to solve',
            'Outline your proposed solution',
            'Include a cost-benefit analysis',
            'Attach supporting documents if any',
        ],
    },
    {
        number: '02',
        title: 'Initial Review',
        description: 'Once submitted, your idea enters the review pipeline where it is assigned to an officer for evaluation and classification.',
        details: [
            'Idea is assigned to a RI&KM officer',
            'Officer classifies the idea by type',
            'Idea is evaluated based on merit',
            'You may be asked for revisions',
            'Status updates are visible in your dashboard',
        ],
    },
    {
        number: '03',
        title: 'Decision & Implementation',
        description: 'The Director General reviews recommendations and makes a final decision on your idea.',
        details: [
            'DG reviews the officer\'s recommendation',
            'Decision: Approve, Decline, or Defer',
            'Approved ideas are budgeted',
            'Implementation is tracked to completion',
            'You earn recognition points for contributions',
        ],
    },
];

export default function HowItWorks() {
    return (
        <>
            <Head title="How It Works" />

            <style>{`
                @keyframes draw-line {
                    0% { width: 0; }
                    100% { width: 100%; }
                }
            `}</style>

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-black via-black/95 to-black/90 py-24 lg:py-32">
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow/5 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wider text-white/50 uppercase backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
                            Process
                        </span>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            How It <span className="text-yellow">Works</span>
                        </h1>
                        <p className="mt-4 text-lg text-white/50">
                            From submission to implementation — here is how the KeNHAVATE process works.
                        </p>
                    </div>

                    {/* Step numbers visual */}
                    <div className="mt-16 flex items-center justify-center gap-4 sm:gap-8">
                        {steps.map((step, i) => (
                            <div key={step.number} className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow/10 text-lg font-bold text-yellow sm:h-16 sm:w-16 sm:text-xl">
                                    {step.number}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden h-px w-12 border-t border-dashed border-yellow/30 sm:block md:w-20" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* ─── DETAILED STEPS ─── */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-beige)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,_rgba(248,235,213,0.03)_0%,_transparent_70%)]" />

                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-20">
                        {steps.map((step, i) => (
                            <div key={step.number} className="relative">
                                {i < steps.length - 1 && (
                                    <div className="absolute left-8 top-20 bottom-0 w-px bg-gradient-to-b from-yellow/30 to-transparent hidden md:block" />
                                )}
                                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow text-xl font-bold text-black shadow-lg shadow-yellow/20">
                                        {step.number}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{step.title}</h2>
                                        <p className="mt-2 text-muted-foreground">{step.description}</p>
                                        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                                            {step.details.map((detail) => (
                                                <li key={detail} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow/10">
                                                        <svg className="h-3 w-3 text-yellow-700 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="relative overflow-hidden bg-black py-20 lg:py-28">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow/10" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow/5" />

                <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Ready to get started?
                    </h2>
                    <p className="mt-3 text-white/40">
                        Sign up and submit your first idea today.
                    </p>
                    <div className="mt-8">
                        <Link
                            href={login()}
                            className="group inline-flex items-center gap-2 rounded-xl bg-yellow px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-yellow/20 transition-all hover:bg-yellow/90 hover:shadow-xl hover:shadow-yellow/25 active:scale-[0.97]"
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
