import { Head, Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
    return (
        <>
            <Head title="Contact" />

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-black via-black/95 to-black/90 py-24 lg:py-32">
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-yellow/5 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-40 right-10 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wider text-white/50 uppercase backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow" />
                            Contact
                        </span>
                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Get in <span className="text-yellow">Touch</span>
                        </h1>
                        <p className="mt-4 text-lg text-white/50">
                            Have a question or feedback? We'd love to hear from you.
                        </p>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* ─── FORM + INFO ─── */}
            <section className="relative overflow-hidden py-20 lg:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-beige)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(248,235,213,0.03)_0%,_transparent_70%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
                        {/* Form */}
                        <div className="lg:col-span-3">
                            <div className="rounded-2xl border bg-card/50 p-6 sm:p-8">
                                <h2 className="text-xl font-bold tracking-tight">Send us a message</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Fill out the form below and we'll get back to you shortly.
                                </p>

                                <Form
                                    method="post"
                                    action="/contact"
                                    className="mt-6 space-y-5"
                                    resetOnSuccess={true}
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input id="name" name="name" required placeholder="Your name" />
                                                <InputError message={errors.name} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                                                <InputError message={errors.email} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="subject">Subject</Label>
                                                <Input id="subject" name="subject" required placeholder="What is this about?" />
                                                <InputError message={errors.subject} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="message">Message</Label>
                                                <Textarea id="message" name="message" rows={5} required placeholder="Your message..." />
                                                <InputError message={errors.message} />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={processing}>
                                                {processing ? 'Sending...' : 'Send Message'}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </div>
                        </div>

                        {/* Info cards */}
                        <div className="space-y-4 lg:col-span-2">
                            <div className="rounded-2xl border bg-card/50 p-6">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow/10">
                                    <svg className="h-5 w-5 text-yellow-700 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold">Visit Us</h3>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <p>KeNHA Headquarters</p>
                                    <p>Blue Shield Towers, 6th Floor</p>
                                    <p>Hospital Road, Upper Hill</p>
                                    <p>P.O. Box 49712-00100</p>
                                    <p>Nairobi, Kenya</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-card/50 p-6">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                    <svg className="h-5 w-5 text-amber-700 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold">Contact Information</h3>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p>
                                        <span className="font-medium text-foreground">Email:</span>{' '}
                                        <a href="mailto:innovate@kenha.co.ke" className="text-muted-foreground hover:text-foreground transition-colors">
                                            innovate@kenha.co.ke
                                        </a>
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">Phone:</span>{' '}
                                        <a href="tel:+254202727001" className="text-muted-foreground hover:text-foreground transition-colors">
                                            +254 20 272 7001
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-card/50 p-6">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                    <svg className="h-5 w-5 text-emerald-700 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold">Working Hours</h3>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                                    <p>Saturday - Sunday: Closed</p>
                                    <p className="mt-2">Public holidays: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
