import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bug, ImageUp, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import bugReports from '@/routes/bug-reports';

export default function CreateBugReport() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        setAttachments((prev) => [...prev, ...files].slice(0, 5));
        e.target.value = '';
    }

    function removeFile(index: number) {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        attachments.forEach((file) => {
            formData.append('attachments[]', file);
        });

        router.post(bugReports.store().url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Report a Bug" />

            <div className="flex h-full 3xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" asChild>
                            <Link href={bugReports.index().url}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                </div>

                <Heading title="Report a Bug" description="Help us improve by reporting issues you encounter." />

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        Bug Details
                                    </h3>
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="title">
                                        Title <span className="ml-0.5 text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Brief title describing the issue"
                                        required
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="description">
                                        Description <span className="ml-0.5 text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior."
                                        rows={6}
                                        required
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        Attachments
                                    </h3>
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" asChild>
                                            <label className="cursor-pointer">
                                                <ImageUp className="mr-2 h-4 w-4" />
                                                Upload Files
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                                    className="hidden"
                                                    onChange={handleFileSelect}
                                                />
                                            </label>
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            Images, PDF, DOC, TXT (max 10MB each, up to 5 files)
                                        </span>
                                    </div>
                                    {attachments.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {attachments.map((file, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Bug className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="truncate">{file.name}</span>
                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            ({(file.size / 1024).toFixed(0)} KB)
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(i)}
                                                        className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <InputError message={errors['attachments.0'] ?? errors.attachments} />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex gap-4 pt-2">
                                <Button type="submit" size="lg" disabled={processing}>
                                    {processing && <Spinner className="mr-2" />}
                                    Submit Report
                                </Button>
                                <Button type="button" size="lg" variant="outline" asChild>
                                    <Link href={bugReports.index().url}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

CreateBugReport.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bug Reports', href: bugReports.index().url },
        { title: 'Report a Bug', href: bugReports.create().url },
    ],
};
