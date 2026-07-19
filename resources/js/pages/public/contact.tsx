import { Head, Form } from "@inertiajs/react";
import InputError from "@/components/input-error";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
    return (
        <>
            <Head title="Contact" />

            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Have a question or feedback? Get in touch with the KeNHAVATE team.
                    </p>
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send us a message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form
                                method="post"
                                action="/contact"
                                className="space-y-4"
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
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Visit Us</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>KeNHA Headquarters</p>
                                <p>Blue Shield Towers, 6th Floor</p>
                                <p>Hospital Road, Upper Hill</p>
                                <p>P.O. Box 49712-00100</p>
                                <p>Nairobi, Kenya</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">Email:</span>{' '}
                                    <a href="mailto:innovate@kenha.co.ke" className="text-black hover:underline">
                                        innovate@kenha.co.ke
                                    </a>
                                </p>
                                <p>
                                    <span className="font-medium">Phone:</span>{' '}
                                    <a href="tel:+254202727001" className="text-black hover:underline">
                                        +254 20 272 7001
                                    </a>
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Working Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm text-muted-foreground">
                                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                                <p>Saturday - Sunday: Closed</p>
                                <p className="mt-2">Public holidays: Closed</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
