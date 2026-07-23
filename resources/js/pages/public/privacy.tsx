import { Head } from '@inertiajs/react';
import { Shield, ChevronDown, Check, FileText, Gavel } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

const sections = [
    {
        number: 1,
        title: 'Introduction',
        summary:
            'KeNHA is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    Kenya National Highways Authority (&ldquo;KeNHA,&rdquo; &ldquo;we,&rdquo;
                    &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting the privacy
                    of individuals who use the KENHAVATE innovation portal and any other related
                    websites, mobile applications, or online services (collectively, the
                    &ldquo;Sites&rdquo;).
                </p>
                <p className="text-gray dark:text-zinc-300">
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your
                    information when you visit or use our Sites. It also describes your rights
                    under the Kenya Data Protection Act, 2019 and how you can exercise them.
                </p>
                <p className="text-gray dark:text-zinc-300">
                    By accessing or using the Sites, you consent to the collection and use of your
                    information as described in this Privacy Policy. If you do not agree with our
                    policies and practices, please do not use our Sites.
                </p>
                <p className="text-gray dark:text-zinc-300">
                    This policy is incorporated into and forms part of our Terms and Conditions.
                </p>
            </div>
        ),
    },
    {
        number: 2,
        title: 'Information We Collect',
        summary:
            'We collect information you provide directly (name, email, ideas) and automatically (usage data, device info, cookies).',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-medium text-black dark:text-white">
                    Personal Information You Provide:
                </p>
                <p className="text-gray dark:text-zinc-300">
                    We collect personal information that you voluntarily provide when you:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>Register for an account on KENHAVATE</li>
                    <li>Submit an idea, innovation, or proposal</li>
                    <li>Participate in discussions or collaborative features</li>
                    <li>Contact us through our support channels</li>
                    <li>Subscribe to newsletters or communications</li>
                </ul>
                <p className="text-gray dark:text-zinc-300">
                    This information may include your full name, email address, phone number,
                    professional affiliation, and any content you submit through the platform.
                </p>

                <p className="font-medium text-black dark:text-white">
                    Information Collected Automatically:
                </p>
                <p className="text-gray dark:text-zinc-300">
                    When you access our Sites, we may automatically collect certain information
                    including:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>Device information (browser type, operating system, IP address)</li>
                    <li>Usage data (pages visited, time spent, clicks, and navigation patterns)</li>
                    <li>Cookies and similar tracking technologies (see Section 7)</li>
                </ul>

                <p className="font-medium text-black dark:text-white">
                    Information from Third Parties:
                </p>
                <p className="text-gray dark:text-zinc-300">
                    If you choose to sign in using third-party authentication services (e.g.,
                    Google), we may receive profile information such as your name and email address
                    from that service, subject to your privacy settings on that platform.
                </p>
            </div>
        ),
    },
    {
        number: 3,
        title: 'How We Use Your Information',
        summary:
            'Your data is used to operate the platform, process innovations, communicate with you, and comply with legal obligations.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>
                        <strong>To provide and maintain the Sites:</strong> To create and manage
                        your account, process your innovation submissions, and enable collaboration
                        features.
                    </li>
                    <li>
                        <strong>To communicate with you:</strong> To send administrative messages,
                        updates about your submissions, respond to inquiries, and provide customer
                        support.
                    </li>
                    <li>
                        <strong>To improve our services:</strong> To analyze usage patterns,
                        diagnose technical issues, and enhance user experience.
                    </li>
                    <li>
                        <strong>To comply with legal obligations:</strong> To fulfill our duties under
                        the Access to Information Act and the Data Protection Act, Laws of Kenya.
                    </li>
                    <li>
                        <strong>With your consent:</strong> For any other purpose with your explicit
                        consent.
                    </li>
                </ul>
            </div>
        ),
    },
    {
        number: 4,
        title: 'Legal Basis for Processing',
        summary:
            'We process your data based on consent, contractual necessity, legal obligation, and legitimate interests under the DPA, 2019.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    Under the Kenya Data Protection Act, 2019, we process your personal information
                    based on the following legal bases:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>
                        <strong>Consent:</strong> Where you have provided your consent for the
                        processing of your personal data for specific purposes.
                    </li>
                    <li>
                        <strong>Contractual necessity:</strong> Where processing is necessary for
                        the performance of a contract with you, such as managing your account and
                        processing your innovation submissions.
                    </li>
                    <li>
                        <strong>Legal obligation:</strong> Where processing is required to comply
                        with applicable laws and regulations.
                    </li>
                    <li>
                        <strong>Legitimate interests:</strong> Where processing is necessary for our
                        legitimate interests, provided such interests do not override your
                        fundamental rights and freedoms.
                    </li>
                </ul>
            </div>
        ),
    },
    {
        number: 5,
        title: 'Data Sharing and Disclosure',
        summary:
            'We do not sell your data. We may share it with service providers, government bodies when required by law, or with your consent.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    We do not sell, trade, or rent your personal information to third parties. We
                    may share your information in the following circumstances:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>
                        <strong>Service providers:</strong> With trusted third-party vendors who
                        assist us in operating our Sites and services, subject to contractual
                        obligations to protect your data.
                    </li>
                    <li>
                        <strong>Legal requirements:</strong> When required by law, court order, or
                        governmental regulation, or to establish, exercise, or defend legal claims.
                    </li>
                    <li>
                        <strong>With your consent:</strong> With third parties when you have given
                        explicit consent for specific sharing.
                    </li>
                    <li>
                        <strong>Within KeNHA:</strong> With affiliated departments for purposes
                        consistent with this Privacy Policy.
                    </li>
                </ul>
            </div>
        ),
    },
    {
        number: 6,
        title: 'Your Rights Under DPA, 2019',
        summary:
            'You have the right to access, correct, delete, and restrict processing of your data. Contact us to exercise these rights.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    The Kenya Data Protection Act, 2019 grants you the following rights regarding
                    your personal data:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>
                        <strong>Right to be informed:</strong> About the collection and use of your
                        personal data.
                    </li>
                    <li>
                        <strong>Right of access:</strong> To request access to personal data we hold
                        about you.
                    </li>
                    <li>
                        <strong>Right to rectification:</strong> To request correction of inaccurate
                        or incomplete personal data.
                    </li>
                    <li>
                        <strong>Right to erasure:</strong> To request deletion of your personal data
                        in certain circumstances (&ldquo;right to be forgotten&rdquo;).
                    </li>
                    <li>
                        <strong>Right to restrict processing:</strong> To request restriction of
                        processing in certain circumstances.
                    </li>
                    <li>
                        <strong>Right to data portability:</strong> To receive your personal data in
                        a structured, commonly used format.
                    </li>
                    <li>
                        <strong>Right to object:</strong> To object to processing based on
                        legitimate interests or for direct marketing.
                    </li>
                    <li>
                        <strong>Right not to be subject to automated decision-making:</strong>{' '}
                        Including profiling, which produces legal effects concerning you.
                    </li>
                </ul>
                <p className="text-gray dark:text-zinc-300">
                    To exercise any of these rights, please contact us using the details provided in
                    Section 10. We will respond to your request within the timeframes prescribed by
                    the DPA, 2019.
                </p>
                <p className="text-gray dark:text-zinc-300">
                    If you are not satisfied with our response, you have the right to lodge a
                    complaint with the Office of the Data Protection Commissioner (ODPC).
                </p>
            </div>
        ),
    },
    {
        number: 7,
        title: 'Cookies and Tracking',
        summary:
            'We use cookies and similar technologies to enhance your experience, analyze usage, and provide authentication.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    Our Sites use cookies and similar tracking technologies to enhance user
                    experience, analyze usage patterns, and provide essential functionality.
                </p>

                <p className="font-medium text-black dark:text-white">Types of Cookies We Use:</p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>
                        <strong>Essential cookies:</strong> Necessary for the operation of our
                        Sites, including authentication and security.
                    </li>
                    <li>
                        <strong>Analytics cookies:</strong> To understand how visitors interact with
                        our Sites, helping us improve functionality.
                    </li>
                    <li>
                        <strong>Preference cookies:</strong> To remember your settings and
                        preferences.
                    </li>
                </ul>

                <p className="text-gray dark:text-zinc-300">
                    You can control cookie preferences through your browser settings. However,
                    disabling certain cookies may affect the functionality of our Sites.
                </p>
            </div>
        ),
    },
    {
        number: 8,
        title: 'Data Security',
        summary:
            'We implement technical and organizational measures to protect your data against unauthorized access, loss, or misuse.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    We implement appropriate technical and organizational security measures to
                    protect your personal information against unauthorized access, alteration,
                    disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>Encryption of data in transit using TLS/SSL protocols</li>
                    <li>Secure server infrastructure with access controls</li>
                    <li>Regular security assessments and monitoring</li>
                    <li>Staff training on data protection practices</li>
                    <li>Incident response procedures for data breaches</li>
                </ul>
                <p className="text-gray dark:text-zinc-300">
                    While we strive to protect your personal data, no method of transmission over
                    the Internet or electronic storage is 100% secure. We cannot guarantee absolute
                    security.
                </p>
            </div>
        ),
    },
    {
        number: 9,
        title: 'Data Retention',
        summary:
            'We retain your data only as long as necessary to fulfill the purposes outlined in this policy or as required by law.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    We retain your personal information only for as long as necessary to fulfill the
                    purposes for which it was collected, or as required by applicable laws and
                    regulations.
                </p>
                <p className="text-gray dark:text-zinc-300">
                    When we no longer need your personal information, we will securely delete or
                    anonymize it. If deletion is not possible (e.g., due to legal retention
                    requirements), we will securely isolate your data from further processing.
                </p>
                <p className="text-gray dark:text-zinc-300">
                    Account information is retained for the duration of your account and for a
                    reasonable period thereafter to comply with legal obligations and resolve
                    disputes.
                </p>
            </div>
        ),
    },
    {
        number: 10,
        title: 'Contact Information',
        summary:
            'For questions, complaints, or to exercise your data rights, contact KeNHA\'s Director, Policy, Research and Compliance.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray dark:text-zinc-300">
                    If you have any questions, concerns, or complaints regarding this Privacy Policy
                    or our data practices, or if you wish to exercise your rights under the Data
                    Protection Act, 2019, please contact us at:
                </p>

                <div className="rounded-lg border border-gray/15 bg-beige/30 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <p className="font-medium text-black dark:text-white">KeNHA:</p>
                    <p className="text-gray dark:text-zinc-300">
                        Director, Policy, Research and Compliance.
                        <br />
                        prc@kenha.co.ke
                        <br />
                        Block C, 4th Floor, Barabara Plaza,
                        <br />
                        Mazao Road, JKIA Airport,
                        <br />
                        Nairobi Kenya.
                    </p>
                </div>

                <p className="text-gray dark:text-zinc-300">
                    You also have the right to lodge a complaint with the Office of the Data
                    Protection Commissioner (ODPC):
                </p>

                <div className="rounded-lg border border-gray/15 bg-beige/30 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <p className="font-medium text-black dark:text-white">ODPC:</p>
                    <p className="text-gray dark:text-zinc-300">
                        Office of the Data Protection Commissioner
                        <br />
                        P.O. Box 52643 &ndash; 00200
                        <br />
                        Nairobi, Kenya
                        <br />
                        Email: datacommissioner@odpc.go.ke
                    </p>
                </div>

                <p className="text-center text-xs font-medium text-gray dark:text-zinc-400">
                    Last updated: July 2026
                </p>
            </div>
        ),
    },
];

export default function Privacy({ title }: { title: string }) {
    const [openSection, setOpenSection] = useState<number>(1);
    const [viewedSections, setViewedSections] = useState<Set<number>>(new Set([1]));
    const sectionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const activeSection = sections.find((s) => s.number === openSection);

    useEffect(() => {
        if (sections.length > 0) {
            setOpenSection(1);
        }
    }, []);

    const handleToggle = (num: number) => {
        const next = openSection === num ? null : num;
        setOpenSection(next);
        if (next !== null) {
            setViewedSections((prev) => new Set(prev).add(next));
            requestAnimationFrame(() => {
                sectionRefs.current.get(next)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    };

    const setRef = (num: number, el: HTMLDivElement | null) => {
        if (el) {
            sectionRefs.current.set(num, el);
        } else {
            sectionRefs.current.delete(num);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-beige/20 via-white to-beige/10 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
            <Head title={title} />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                {/* Header */}
                <div className="mb-10 text-center lg:mb-14">
                    <div className="mb-4 inline-flex items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow shadow-lg shadow-yellow/20">
                            <Shield className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
                            {title}
                        </h1>
                    </div>
                    <p className="mx-auto max-w-lg text-gray dark:text-zinc-400">
                        Last updated: July 2026. How we collect, use, and protect your data.
                    </p>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr]">
                    {/* Left: Summary Panel */}
                    <aside className="lg:sticky lg:top-24 lg:h-fit">
                        <div className="rounded-2xl border border-gray/15 bg-linear-to-t from-beige to-yellow/5 p-8 shadow-xl dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800">
                            {activeSection ? (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-yellow text-xs font-bold text-black">
                                            {activeSection.number}
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-yellow">
                                            Current Section
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-lg font-bold text-black dark:text-white">
                                        {activeSection.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray dark:text-zinc-400">
                                        {activeSection.summary}
                                    </p>
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray/5 dark:bg-zinc-700">
                                        <Gavel className="h-6 w-6 text-gray/40" />
                                    </div>
                                    <p className="mt-3 text-sm text-gray dark:text-zinc-400">
                                        Select a section to view its summary
                                    </p>
                                </div>
                            )}

                            <Separator className="my-6" />

                            {/* Progress */}
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-medium text-black dark:text-white">
                                        Sections
                                    </span>
                                    <span className="text-xs text-gray">
                                        {viewedSections.size} of {sections.length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sections.map((s) => {
                                        const viewed = viewedSections.has(s.number);
                                        const active = openSection === s.number;
                                        return (
                                            <button
                                                key={s.number}
                                                type="button"
                                                onClick={() => handleToggle(s.number)}
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                                                    viewed
                                                        ? 'bg-yellow text-black'
                                                        : 'bg-gray/10 text-gray dark:bg-zinc-700 dark:text-zinc-400'
                                                } ${active ? 'ring-2 ring-yellow ring-offset-2 dark:ring-offset-zinc-800' : ''} hover:scale-110`}
                                                title={s.title}
                                            >
                                                {viewed ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    s.number
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="flex items-start gap-3">
                                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow" />
                                <p className="text-xs leading-relaxed text-gray dark:text-zinc-500">
                                    Your data is protected under Kenya&apos;s Data Protection Act,
                                    2019.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Right: Accordion */}
                    <main className="space-y-3">
                        {sections.map((section) => {
                            const isOpen = openSection === section.number;
                            const viewed = viewedSections.has(section.number);
                            return (
                                <div key={section.number} ref={(el) => setRef(section.number, el)}>
                                    <Collapsible
                                        open={isOpen}
                                        onOpenChange={() => handleToggle(section.number)}
                                        className={`group rounded-xl border transition-all duration-200 ${
                                            isOpen
                                                ? 'border-yellow/30 bg-white shadow-md dark:border-yellow/20 dark:bg-zinc-800'
                                                : 'border-gray/15 bg-white hover:border-gray/30 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600'
                                        }`}
                                    >
                                        <CollapsibleTrigger className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6">
                                            <div
                                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                    viewed
                                                        ? 'bg-yellow text-black'
                                                        : 'bg-gray/10 text-gray dark:bg-zinc-700 dark:text-zinc-400'
                                                }`}
                                            >
                                                {viewed ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    section.number
                                                )}
                                            </div>
                                            <span className="flex-1 text-base font-semibold text-black dark:text-white">
                                                {section.title}
                                            </span>
                                            {viewed && (
                                                <span className="hidden text-xs font-medium text-green-600 sm:block dark:text-green-400">
                                                    Read
                                                </span>
                                            )}
                                            <ChevronDown
                                                className={`h-5 w-5 flex-shrink-0 text-gray transition-transform duration-200 ${
                                                    isOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <div className="border-t border-gray/10 px-5 pb-5 pt-4 dark:border-zinc-700 sm:px-6">
                                                {section.content}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            );
                        })}
                    </main>
                </div>
            </div>
        </div>
    );
}
