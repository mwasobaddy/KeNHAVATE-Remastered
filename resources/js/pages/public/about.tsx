import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <>
            <Head title="About" />

            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">About KeNHAVATE</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        KeNHAVATE is the innovation management platform for the Kenya National Highways Authority.
                    </p>
                </div>

                <div className="mt-12 space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold">Our Mission</h2>
                        <p className="mt-3 text-muted-foreground leading-relaxed">
                            To harness the collective creativity of KeNHA employees and stakeholders by providing
                            a structured platform for submitting, reviewing, and implementing innovative ideas
                            that improve Kenya's road infrastructure and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">Why KeNHAVATE?</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            {[
                                {
                                    title: 'Crowdsourced Innovation',
                                    description: 'Every employee, regardless of role, can contribute ideas that make a difference.',
                                },
                                {
                                    title: 'Transparent Process',
                                    description: 'Track your idea from submission through review, decision, and implementation.',
                                },
                                {
                                    title: 'Collaboration',
                                    description: 'Work with colleagues to refine and improve ideas before submission.',
                                },
                                {
                                    title: 'Recognition',
                                    description: 'Earn points and recognition for your contributions to KeNHA\'s innovation culture.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="rounded-xl border bg-card p-6">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">Who Can Participate?</h2>
                        <p className="mt-3 text-muted-foreground leading-relaxed">
                            All KeNHA employees, contractors, and partners with a valid email address can
                            submit ideas, collaborate with colleagues, and participate in the innovation process.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
                        <div className="mt-6 space-y-6">
                            {[
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
                                    a: 'Yes. You can enable collaboration on your idea to allow colleagues to contribute, propose changes, and help refine it before or during the review process.',
                                },
                                {
                                    q: 'What about intellectual property?',
                                    a: 'You can specify IP protection status when submitting your idea. KeNHA respects your IP rights and the platform allows you to document patent numbers and related information.',
                                },
                            ].map((faq) => (
                                <div key={faq.q} className="rounded-xl border bg-card p-6">
                                    <h3 className="font-semibold">{faq.q}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
