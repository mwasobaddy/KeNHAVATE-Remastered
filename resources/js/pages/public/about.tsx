import { Head } from '@inertiajs/react';

const features = [
    {
        title: 'Crowdsourced Innovation',
        description: 'Anyone can contribute ideas that make a difference.',
        icon: '💡',
    },
    {
        title: 'Transparent Process',
        description: 'Track your idea from submission through review, decision, and implementation.',
        icon: '🔍',
    },
    {
        title: 'Collaboration',
        description: 'Work with others to refine and improve ideas before submission.',
        icon: '🤝',
    },
    {
        title: 'Recognition',
        description: 'Earn points and recognition for your contributions to KeNHA\'s innovation culture.',
        icon: '🏆',
    },
];

const faqs = [
    {
        q: 'What kinds of ideas can I submit?',
        a: 'Any idea that could improve KeNHA\'s operations, road infrastructure, safety, efficiency, or services. This includes technical innovations, process improvements, cost-saving measures, and community engagement initiatives.',
    },
    {
        q: 'What happens after I submit my idea?',
        a: 'Your idea enters a review pipeline. It is assigned to an officer who classifies and evaluates it. The Director General then makes a final decision. You can track progress from your dashboard.',
    },
    {
        q: 'Can I collaborate with others on my idea?',
        a: 'Yes. You can enable collaboration on your idea to allow others to contribute, propose changes, and help refine it before or during the review process.',
    },
    {
        q: 'What about intellectual property?',
        a: 'You can specify IP protection status when submitting your idea. KeNHA respects your IP rights and the platform allows you to document patent numbers and related information.',
    },
];

export default function About() {
    return (
        <>
            <Head title="About" />

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-black via-black/95 to-black/90 py-24 lg:py-32">
                <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-yellow/5 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wider text-white/50 uppercase backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
                            About
                        </span>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            About <span className="text-yellow">KeNHAVATE</span>
                        </h1>
                        <p className="mt-4 text-lg text-white/50">
                            The innovation management platform for the Kenya National Highways Authority.
                        </p>
                    </div>

                    {/* Mission card */}
                    <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
                        <h2 className="text-xl font-bold text-white sm:text-2xl">Our Mission</h2>
                        <p className="mt-4 leading-relaxed text-white/50">
                            To harness the collective creativity of the public, partners, and stakeholders by providing
                            a structured platform for submitting, reviewing, and implementing innovative ideas
                            that improve Kenya's road infrastructure and services.
                        </p>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* ─── WHY KeNHAVATE? ─── */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-beige)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(248,235,213,0.03)_0%,_transparent_70%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-block rounded-full bg-yellow/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-yellow-700 uppercase dark:text-yellow-300">
                            Why KeNHAVATE?
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Built for <span className="px-4 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-black dark:before:bg-white relative inline-block"><span className="relative text-yellow dark:text-black">innovation</span></span>
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2">
                        {features.map((feature, i) => (
                            <div
                                key={feature.title}
                                className={`group relative overflow-hidden rounded-2xl border bg-card/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7`}
                            >
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.03] via-transparent to-transparent dark:from-white/[0.06]" />
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent dark:via-white/20" />
                                <div className="relative z-10 mb-3 text-2xl">{feature.icon}</div>
                                <h3 className="relative z-10 text-lg font-semibold">{feature.title}</h3>
                                <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── WHO CAN PARTICIPATE ─── */}
            <section className="relative overflow-hidden bg-black py-20 lg:py-24">
                <div className="pointer-events-none absolute left-1/3 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-yellow/30 to-transparent" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wider text-white/40 uppercase backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
                            Eligibility
                        </span>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Who Can <span className="text-yellow">Participate?</span>
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-white/50">
                            Anyone with a valid email address can
                            submit ideas, collaborate with others, and participate in the innovation process.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-beige)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,_rgba(248,235,213,0.03)_0%,_transparent_70%)]" />

                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-block rounded-full bg-yellow/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-yellow-700 uppercase dark:text-yellow-300">
                            FAQ
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Frequently Asked <span className="px-4 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-black dark:before:bg-white relative inline-block"><span className="relative text-yellow dark:text-black">Questions</span></span>
                        </h2>
                    </div>

                    <div className="mt-12 space-y-4">
                        {faqs.map((faq, i) => (
                            <details
                                key={faq.q}
                                className="group relative overflow-hidden rounded-2xl border bg-card/50 shadow-sm transition-all duration-200 hover:border-yellow/30 hover:shadow-md open:border-yellow/30 open:shadow-md"
                            >
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.03] via-transparent to-transparent dark:from-white/[0.06]" />
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent dark:via-white/20" />
                                <summary className="relative z-10 flex cursor-pointer items-center justify-between px-6 py-5 text-sm font-semibold sm:text-base">
                                    <span className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow/10 text-xs font-bold text-yellow-700 dark:text-yellow-300">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        {faq.q}
                                    </span>
                                    <svg
                                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div className="border-t px-6 py-5 pt-4">
                                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
