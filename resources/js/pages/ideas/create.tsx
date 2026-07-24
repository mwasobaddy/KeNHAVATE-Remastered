import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { FileUpload } from '@/components/file-upload';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import ideas from '@/routes/ideas';

type Category = {
    id: number;
    name: string;
    description: string | null;
};

type Props = {
    categories: Category[];
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PROPOSAL_TYPES = ['pdf'];
const IP_TYPES = ['pdf'];
const SUPPORT_TYPES = ['pdf', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

function validateTypes(files: File[], allowed: string[]): boolean {
    return files.every((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase() ?? '';

        return allowed.includes(ext);
    });
}

function validateSize(files: File[]): boolean {
    return files.every((f) => f.size <= MAX_FILE_SIZE);
}

function Required({ children }: { children: React.ReactNode }) {
    return (
        <span>
            {children}
            <span className="ml-0.5 text-destructive">*</span>
        </span>
    );
}

export default function CreateIdea({ categories }: Props) {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [proposedSolution, setProposedSolution] = useState('');
    const [costBenefitAnalysis, setCostBenefitAnalysis] = useState('');
    const [proposalFile, setProposalFile] = useState<File | null>(null);
    const [supportDocuments, setSupportDocuments] = useState<File[]>([]);
    const [hasIpProtection, setHasIpProtection] = useState('0');
    const [patentNumber, setPatentNumber] = useState('');
    const [ipDocument, setIpDocument] = useState<File | null>(null);
    const [consentGiven, setConsentGiven] = useState(false);
    const [teamEmails, setTeamEmails] = useState('');
    const [collaborationEnabled, setCollaborationEnabled] = useState(true);

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (!title.trim()) {
errs.title = 'Title is required.';
}

        if (!categoryId) {
errs.category_id = 'Category is required.';
}

        if (!description.trim()) {
errs.description = 'Description is required.';
}

        if (!problemStatement.trim()) {
errs.problem_statement = 'Problem statement is required.';
}

        if (!proposedSolution.trim()) {
errs.proposed_solution = 'Proposed solution is required.';
}

        if (!costBenefitAnalysis.trim()) {
errs.cost_benefit_analysis = 'Cost-benefit analysis is required.';
}

        if (!proposalFile) {
            errs.proposal_file = 'Proposal file is required.';
        } else {
            const ext = proposalFile.name.split('.').pop()?.toLowerCase() ?? '';

            if (!PROPOSAL_TYPES.includes(ext)) {
                errs.proposal_file = 'Proposal must be a PDF file.';
            } else if (proposalFile.size > MAX_FILE_SIZE) {
                errs.proposal_file = 'Proposal file must be under 10MB.';
            }
        }

        if (hasIpProtection === '1') {
            if (!patentNumber.trim()) {
errs.patent_number = 'Patent number is required when IP is protected.';
}

            if (!ipDocument) {
                errs.ip_document = 'Patent document is required when IP is protected.';
            } else {
                const ext = ipDocument.name.split('.').pop()?.toLowerCase() ?? '';

                if (!IP_TYPES.includes(ext)) {
                    errs.ip_document = 'Patent document must be a PDF file.';
                } else if (ipDocument.size > MAX_FILE_SIZE) {
                    errs.ip_document = 'Patent document must be under 10MB.';
                }
            }
        }

        if (supportDocuments.length > 0) {
            if (!validateTypes(supportDocuments, SUPPORT_TYPES)) {
                errs.support_documents = 'Supporting documents must be PDF, XLS, XLSX, JPG, or PNG files.';
            } else if (!validateSize(supportDocuments)) {
                errs.support_documents = 'Each supporting document must be under 10MB.';
            }
        }

        if (!consentGiven) {
errs.consent_given = 'You must give consent to proceed.';
}

        setClientErrors(errs);

        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
return;
}

        setSubmitting(true);

        const payload: Record<string, unknown> = {
            title,
            category_id: categoryId,
            description,
            problem_statement: problemStatement,
            proposed_solution: proposedSolution,
            cost_benefit_analysis: costBenefitAnalysis,
            has_ip_protection: hasIpProtection,
            consent_given: consentGiven ? '1' : '0',
            collaboration_enabled: collaborationEnabled ? '1' : '0',
            proposal_file: proposalFile,
        };

        if (patentNumber) {
payload.patent_number = patentNumber;
}

        if (teamEmails) {
payload.team_emails = teamEmails;
}

        if (supportDocuments.length > 0) {
payload.support_documents = supportDocuments;
}

        if (ipDocument) {
payload.ip_document = ipDocument;
}

        router.post(ideas.store(), payload, {
            forceFormData: true,
            onError: (errs) => {
                setClientErrors(errs);
                setSubmitting(false);
            },
            onSuccess: () => {
                setSubmitting(false);
            },
            onFinish: () => {
                setSubmitting(false);
            },
        });
    };

    return (
        <>
            <Head title="Submit Idea" />

            <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Submit a New Idea"
                    description="Share your innovation with KeNHA"
                />

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                            {/* ── Idea Details ── */}
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        Idea Details
                                    </h3>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="title">
                                        <Required>Title</Required>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter your idea title"
                                    />
                                    {clientErrors.title && <InputError message={clientErrors.title} />}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="category_id">
                                        <Required>Category</Required>
                                    </Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger id="category_id">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {clientErrors.category_id && <InputError message={clientErrors.category_id} />}
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="description">
                                        <Required>Brief Description</Required>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Summarize your idea in a few sentences"
                                        rows={3}
                                    />
                                    {clientErrors.description && <InputError message={clientErrors.description} />}
                                </div>
                            </div>

                            <Separator />

                            {/* ── Problem & Solution ── */}
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        Problem & Solution
                                    </h3>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="problem_statement">
                                        <Required>Problem Statement</Required>
                                    </Label>
                                    <Textarea
                                        id="problem_statement"
                                        value={problemStatement}
                                        onChange={(e) => setProblemStatement(e.target.value)}
                                        placeholder="What problem does this idea solve?"
                                        rows={4}
                                    />
                                    {clientErrors.problem_statement && <InputError message={clientErrors.problem_statement} />}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="proposed_solution">
                                        <Required>Proposed Solution</Required>
                                    </Label>
                                    <Textarea
                                        id="proposed_solution"
                                        value={proposedSolution}
                                        onChange={(e) => setProposedSolution(e.target.value)}
                                        placeholder="Describe your proposed solution"
                                        rows={4}
                                    />
                                    {clientErrors.proposed_solution && <InputError message={clientErrors.proposed_solution} />}
                                </div>

                                <div className="grid gap-2 lg:col-span-2">
                                    <Label htmlFor="cost_benefit_analysis">
                                        <Required>Cost-Benefit Analysis</Required>
                                    </Label>
                                    <Textarea
                                        id="cost_benefit_analysis"
                                        value={costBenefitAnalysis}
                                        onChange={(e) => setCostBenefitAnalysis(e.target.value)}
                                        placeholder="Outline the costs and expected benefits"
                                        rows={4}
                                    />
                                    {clientErrors.cost_benefit_analysis && <InputError message={clientErrors.cost_benefit_analysis} />}
                                </div>
                            </div>

                            <Separator />

                            {/* ── Documents ── */}
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        Documents
                                    </h3>
                                </div>

                                <FileUpload
                                    accept=".pdf"
                                    label="Full Proposal (PDF — max 10MB)"
                                    required
                                    file={proposalFile}
                                    onFileChange={setProposalFile}
                                    error={clientErrors.proposal_file}
                                />

                                <FileUpload
                                    accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png"
                                    label="Supporting Documents (optional — PDF, XLS, JPG, PNG)"
                                    multiple
                                    files={supportDocuments}
                                    onFilesChange={setSupportDocuments}
                                    error={clientErrors.support_documents}
                                />
                            </div>

                            <Separator />

                            {/* ── Intellectual Property ── */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Intellectual Property
                                </h3>

                                <Card className="border-dashed">
                                    <CardContent className="space-y-5 pt-6">
                                        <div className="space-y-3">
                                            <Label>
                                                <Required>Is this idea IP protected?</Required>
                                            </Label>
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="has_ip_protection"
                                                        value="1"
                                                        checked={hasIpProtection === '1'}
                                                        onChange={(e) => setHasIpProtection(e.target.value)}
                                                        className="h-4 w-4"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="has_ip_protection"
                                                        value="0"
                                                        checked={hasIpProtection === '0'}
                                                        onChange={(e) => setHasIpProtection(e.target.value)}
                                                        className="h-4 w-4"
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </div>

                                        {hasIpProtection === '1' && (
                                            <div className="space-y-5">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="patent_number">
                                                        <Required>Patent Number</Required>
                                                    </Label>
                                                    <Input
                                                        id="patent_number"
                                                        value={patentNumber}
                                                        onChange={(e) => setPatentNumber(e.target.value)}
                                                        placeholder="e.g. KE/P/2025/001234"
                                                    />
                                                    {clientErrors.patent_number && <InputError message={clientErrors.patent_number} />}
                                                </div>

                                                <FileUpload
                                                    accept=".pdf"
                                                    label="Patent Document (PDF — max 10MB)"
                                                    required
                                                    file={ipDocument}
                                                    onFileChange={setIpDocument}
                                                    error={clientErrors.ip_document}
                                                />
                                            </div>
                                        )}

                                        {hasIpProtection === '0' && (
                                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                                <p className="font-medium">Important Notice</p>
                                                <p className="mt-1">
                                                    This idea is not currently IP protected. By submitting,
                                                    you give KeNHA consent to proceed with the initialization
                                                    of Intellectual Property for this idea.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-2">
                                            <input
                                                id="consent_given"
                                                type="checkbox"
                                                checked={consentGiven}
                                                onChange={(e) => setConsentGiven(e.target.checked)}
                                                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="consent_given" className="text-sm leading-5">
                                                <Required>
                                                    I give KeNHA consent to proceed with the
                                                    {hasIpProtection === '1'
                                                        ? ' review and processing of this idea'
                                                        : ' initialization of Intellectual Property for this idea'}
                                                </Required>
                                            </Label>
                                        </div>
                                        {clientErrors.consent_given && <InputError message={clientErrors.consent_given} />}
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

                            {/* ── Team & Collaboration ── */}
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        Team & Collaboration
                                    </h3>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="team_emails">
                                        Team Members (optional — email addresses)
                                    </Label>
                                    <Input
                                        id="team_emails"
                                        value={teamEmails}
                                        onChange={(e) => setTeamEmails(e.target.value)}
                                        placeholder="john@kenha.co.ke, jane@example.com"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Separate multiple emails with commas. Existing users will be added as contributors.
                                        New users will receive an invitation.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-8">
                                    <input
                                        id="collaboration_enabled"
                                        type="checkbox"
                                        checked={collaborationEnabled}
                                        onChange={(e) => setCollaborationEnabled(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="collaboration_enabled">
                                        Allow others to request collaboration
                                    </Label>
                                </div>
                            </div>

                            <Separator />

                            {/* ── Actions ── */}
                            <div className="flex gap-4 pt-2">
                                <Button type="submit" size="lg" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Spinner className="mr-2 h-4 w-4" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Idea'
                                    )}
                                </Button>
                                <Button type="button" size="lg" variant="outline" asChild>
                                    <a href={ideas.index().url}>Cancel</a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateIdea.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Submit Idea', href: '/ideas/create' },
    ],
};
