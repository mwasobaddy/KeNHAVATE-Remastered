import { Head, Link } from '@inertiajs/react';
import { login } from '@/routes';

export default function HowItWorks() {
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

    return (
        <>
            <Head title="How It Works" />

            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">How It Works</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        From submission to implementation — here is how the KeNHAVATE process works.
                    </p>
                </div>

                <div className="mt-16 space-y-16">
                    {steps.map((step, i) => (
                        <div key={step.number} className="relative">
                            {i < steps.length - 1 && (
                                <div className="absolute left-8 top-20 bottom-0 w-px bg-border hidden md:block" />
                            )}
                            <div className="flex flex-col gap-8 md:flex-row md:items-start">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow/20 text-xl font-bold text-black">
                                    {step.number}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold">{step.title}</h2>
                                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                                    <ul className="mt-4 space-y-2">
                                        {step.details.map((detail) => (
                                            <li key={detail} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <svg className="mt-0.5 h-4 w-4 shrink-0 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 rounded-xl border bg-card p-8 text-center">
                    <h2 className="text-2xl font-bold">Ready to get started?</h2>
                    <p className="mt-2 text-muted-foreground">
                        Sign up and submit your first idea today.
                    </p>
                    <div className="mt-6">
                        <Link
                            href={login()}
                            className="inline-flex items-center rounded-lg bg-yellow px-6 py-3 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow/90"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
