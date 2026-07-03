import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function CreateIdea({ categories }: Props) {
    const [hasIpProtection, setHasIpProtection] = useState<string>('0');

    return (
        <>
            <Head title="Submit Idea" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Submit a New Idea"
                    description="Share your innovation with KeNHA"
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            method="post"
                            action={ideas.store()}
                            className="space-y-6"
                            encType="multipart/form-data"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            type="text"
                                            required
                                            placeholder="Enter your idea title"
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="category_id">Category</Label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            required
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.category_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Brief Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            required
                                            placeholder="Summarize your idea in a few sentences"
                                            rows={3}
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="problem_statement">Problem Statement</Label>
                                        <Textarea
                                            id="problem_statement"
                                            name="problem_statement"
                                            required
                                            placeholder="What problem does this idea solve?"
                                            rows={4}
                                        />
                                        <InputError message={errors.problem_statement} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="proposed_solution">Proposed Solution</Label>
                                        <Textarea
                                            id="proposed_solution"
                                            name="proposed_solution"
                                            required
                                            placeholder="Describe your proposed solution"
                                            rows={4}
                                        />
                                        <InputError message={errors.proposed_solution} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="cost_benefit_analysis">
                                            Cost-Benefit Analysis
                                        </Label>
                                        <Textarea
                                            id="cost_benefit_analysis"
                                            name="cost_benefit_analysis"
                                            required
                                            placeholder="Outline the costs and expected benefits"
                                            rows={4}
                                        />
                                        <InputError message={errors.cost_benefit_analysis} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="proposal_file">
                                            Full Proposal (PDF, DOC, DOCX — max 10MB)
                                        </Label>
                                        <Input
                                            id="proposal_file"
                                            name="proposal_file"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                        />
                                        <InputError message={errors.proposal_file} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="support_documents">
                                            Supporting Documents (optional — PDF, DOC, DOCX, XLS, JPG, PNG)
                                        </Label>
                                        <Input
                                            id="support_documents"
                                            name="support_documents[]"
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        />
                                        <InputError message={errors['support_documents.0']} />
                                    </div>

                                    <Card className="border-dashed">
                                        <CardHeader>
                                            <CardTitle className="text-base">Intellectual Property</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <Label>Is this idea IP protected?</Label>
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
                                                <InputError message={errors.has_ip_protection} />
                                            </div>

                                            {hasIpProtection === '1' && (
                                                <>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="patent_number">
                                                            Patent Number (optional)
                                                        </Label>
                                                        <Input
                                                            id="patent_number"
                                                            name="patent_number"
                                                            type="text"
                                                            placeholder="e.g. KE/P/2025/001234"
                                                        />
                                                        <InputError message={errors.patent_number} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="ip_documents">
                                                            Upload Patent Document (PDF, DOC, DOCX — max 10MB)
                                                        </Label>
                                                        <Input
                                                            id="ip_documents"
                                                            name="ip_documents[]"
                                                            type="file"
                                                            multiple
                                                            accept=".pdf,.doc,.docx"
                                                        />
                                                        <InputError message={errors['ip_documents.0']} />
                                                    </div>
                                                </>
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

                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="consent_given"
                                                    type="checkbox"
                                                    name="consent_given"
                                                    value="1"
                                                    className="h-4 w-4 rounded border-gray-300"
                                                    required
                                                />
                                                <Label htmlFor="consent_given" className="text-sm">
                                                    I give KeNHA consent to proceed with the
                                                    {hasIpProtection === '1'
                                                        ? ' review and processing of this idea'
                                                        : ' initialization of Intellectual Property for this idea'}
                                                </Label>
                                            </div>
                                            <InputError message={errors.consent_given} />
                                        </CardContent>
                                    </Card>

                                    <div className="grid gap-2">
                                        <Label htmlFor="team_emails">
                                            Team Members (optional — email addresses)
                                        </Label>
                                        <Input
                                            id="team_emails"
                                            name="team_emails"
                                            type="text"
                                            placeholder="john@kenha.co.ke, jane@example.com"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Separate multiple emails with commas. Existing users will be added as contributors. New users will receive an invitation.
                                        </p>
                                        <InputError message={errors.team_emails} />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            id="collaboration_enabled"
                                            name="collaboration_enabled"
                                            type="checkbox"
                                            value="1"
                                            defaultChecked
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor="collaboration_enabled">
                                            Allow others to request collaboration
                                        </Label>
                                        <InputError message={errors.collaboration_enabled} />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Submitting...' : 'Submit Idea'}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <a href={ideas.index()}>Cancel</a>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
