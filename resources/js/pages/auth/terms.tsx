import { Head, router } from '@inertiajs/react';
import { ChevronDown, Check, FileText, Shield, Gavel } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { sections } from '@/data/terms-sections';

type Props = {
    title: string;
    text: string;
};
export default function Terms({ title }: Props) {
    const [openSection, setOpenSection] = useState<number>(1);
    const [viewedSections, setViewedSections] = useState<Set<number>>(new Set([1]));
    const [accepted, setAccepted] = useState(false);
    const [processingAccept, setProcessingAccept] = useState(false);
    const [processingDecline, setProcessingDecline] = useState(false);
    const sectionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const allViewed = sections.every((s) => viewedSections.has(s.number));
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

    const handleAccept = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accepted) return;
        setProcessingAccept(true);
        router.post('/auth/terms');
    };

    const handleDecline = () => {
        setProcessingDecline(true);
        router.post('/auth/terms/decline');
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
                            <FileText className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
                            {title}
                        </h1>
                    </div>
                    <p className="mx-auto max-w-lg text-gray dark:text-zinc-400">
                        Last Revised: June, 2023. Please review each section below to continue.
                    </p>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr]">
                    {/* Left: Summary Panel */}
                    <aside className="lg:sticky lg:top-24 lg:h-fit">
                        <div className="rounded-2xl border border-gray/15 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80 sm:p-8">
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
                                        Review progress
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

                            {/* Trust note */}
                            <div className="flex items-start gap-3">
                                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow" />
                                <p className="text-xs leading-relaxed text-gray dark:text-zinc-500">
                                    Your data is protected in accordance with Kenya&apos;s Data
                                    Protection Act, 2019. We do not share your personal information
                                    without consent.
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

                        {/* Acceptance form */}
                        <div className="mt-8 rounded-2xl border border-gray/15 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/80 sm:p-8">
                            <Separator className="mb-6" />

                            <form onSubmit={handleAccept} className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="accepted"
                                        checked={accepted}
                                        onCheckedChange={(checked) =>
                                            setAccepted(checked === true)
                                        }
                                        required
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <Label
                                            htmlFor="accepted"
                                            className="text-base font-medium leading-relaxed text-black dark:text-beige"
                                        >
                                            I have read and agree to the Terms and Conditions
                                        </Label>
                                        {!allViewed && (
                                            <p className="mt-1 text-xs text-gray dark:text-zinc-500">
                                                Tip: Review all {sections.length} sections before
                                                accepting
                                            </p>
                                        )}
                                        {allViewed && (
                                            <p className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                <Check className="h-3 w-3" />
                                                You have reviewed all sections
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray/60 dark:text-zinc-500">
                                            Version 1.0 &bull; Last updated: June 2023
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-yellow px-6 py-4 text-base font-semibold text-black shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-yellow/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                        disabled={!accepted || processingAccept}
                                    >
                                        Accept & Continue
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 rounded-xl border-red-200 px-6 py-4 text-base font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                                        onClick={handleDecline}
                                        disabled={processingDecline}
                                    >
                                        Decline & Logout
                                    </Button>
                                </div>

                                <p className="flex items-center justify-center gap-2 text-center text-xs text-gray dark:text-zinc-500">
                                    <Shield className="h-3.5 w-3.5" />
                                    By accepting, you agree to our data processing practices outlined
                                    in our Privacy Policy.
                                </p>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

Terms.layout = {};
