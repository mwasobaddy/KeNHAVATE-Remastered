import { Head, Link, useForm } from '@inertiajs/react';
import idea from '@/routes/idea';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function IdeaEdit({ idea, thematicAreas }) {
    const { data, setData, put, processing, errors } = useForm({
        idea_title: idea.idea_title || '',
        thematic_area_id: idea.thematic_area_id || '',
        abstract: idea.abstract || '',
        problem_statement: idea.problem_statement || '',
        proposed_solution: idea.proposed_solution || '',
        cost_benefit_analysis: idea.cost_benefit_analysis || '',
        declaration_of_interests: idea.declaration_of_interests || '',
        original_idea_disclaimer: idea.original_idea_disclaimer || false,
        collaboration_enabled: idea.collaboration_enabled || false,
        comments_enabled: idea.comments_enabled || false,
        attachment: null,
    });

    const submit = (e) => {
        e.preventDefault();
        put(idea.update(idea.slug).url);
    };

    return (
        <>
            <Head title={`Edit ${idea.idea_title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Edit Idea</h1>
                                <p className="mt-2 text-muted-foreground">Update idea information</p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            {/* Idea Title */}
                            <div className="grid gap-2">
                                <Label htmlFor="idea_title">Idea Title *</Label>
                                <input
                                    id="idea_title"
                                    type="text"
                                    value={data.idea_title}
                                    onChange={(e) => setData('idea_title', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2"
                                    required
                                />
                                <InputError message={errors.idea_title} />
                            </div>

                            {/* Thematic Area */}
                            <div className="grid gap-2">
                                <Label htmlFor="thematic_area_id">Thematic Area *</Label>
                                <Select
                                    value={data.thematic_area_id?.toString()}
                                    onValueChange={(value) => setData('thematic_area_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a thematic area" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {thematicAreas.map((area) => (
                                            <SelectItem key={area.id} value={area.id.toString()}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.thematic_area_id} />
                            </div>

                            {/* Abstract */}
                            <div className="grid gap-2">
                                <Label htmlFor="abstract">Abstract *</Label>
                                <Textarea
                                    id="abstract"
                                    value={data.abstract}
                                    onChange={(e) => setData('abstract', e.target.value)}
                                    required
                                />
                                <InputError message={errors.abstract} />
                            </div>

                            {/* Problem Statement */}
                            <div className="grid gap-2">
                                <Label htmlFor="problem_statement">Problem Statement *</Label>
                                <Textarea
                                    id="problem_statement"
                                    value={data.problem_statement}
                                    onChange={(e) => setData('problem_statement', e.target.value)}
                                    required
                                />
                                <InputError message={errors.problem_statement} />
                            </div>

                            {/* Proposed Solution */}
                            <div className="grid gap-2">
                                <Label htmlFor="proposed_solution">Proposed Solution *</Label>
                                <Textarea
                                    id="proposed_solution"
                                    value={data.proposed_solution}
                                    onChange={(e) => setData('proposed_solution', e.target.value)}
                                    required
                                />
                                <InputError message={errors.proposed_solution} />
                            </div>

                            {/* Cost Benefit Analysis */}
                            <div className="grid gap-2">
                                <Label htmlFor="cost_benefit_analysis">Cost Benefit Analysis *</Label>
                                <Textarea
                                    id="cost_benefit_analysis"
                                    value={data.cost_benefit_analysis}
                                    onChange={(e) => setData('cost_benefit_analysis', e.target.value)}
                                    required
                                />
                                <InputError message={errors.cost_benefit_analysis} />
                            </div>

                            {/* Declaration of Interests */}
                            <div className="grid gap-2">
                                <Label htmlFor="declaration_of_interests">Declaration of Interests *</Label>
                                <Textarea
                                    id="declaration_of_interests"
                                    value={data.declaration_of_interests}
                                    onChange={(e) => setData('declaration_of_interests', e.target.value)}
                                    required
                                />
                                <InputError message={errors.declaration_of_interests} />
                            </div>

                            {/* Original Idea Disclaimer */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="original_idea_disclaimer"
                                    checked={data.original_idea_disclaimer}
                                    onCheckedChange={(checked) => setData('original_idea_disclaimer', checked)}
                                />
                                <Label htmlFor="original_idea_disclaimer">
                                    I confirm this is my original idea and has not been plagiarized *
                                </Label>
                                <InputError message={errors.original_idea_disclaimer} />
                            </div>

                            {/* Collaboration Enabled */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="collaboration_enabled"
                                    checked={data.collaboration_enabled}
                                    onCheckedChange={(checked) => {
                                        setData('collaboration_enabled', checked);
                                        if (!checked) {
                                            setData('comments_enabled', false);
                                        }
                                    }}
                                />
                                <Label htmlFor="collaboration_enabled">
                                    Enable collaboration (make idea public)
                                </Label>
                                <InputError message={errors.collaboration_enabled} />
                            </div>

                            {/* Comments Enabled */}
                            {data.collaboration_enabled && (
                                <div className="ml-6 flex items-center space-x-3">
                                    <Checkbox
                                        id="comments_enabled"
                                        checked={data.comments_enabled}
                                        onCheckedChange={(checked) => setData('comments_enabled', checked)}
                                    />
                                    <Label htmlFor="comments_enabled">
                                        Enable comments
                                    </Label>
                                    <InputError message={errors.comments_enabled} />
                                </div>
                            )}

                            {/* PDF Attachment */}
                            <div className="grid gap-2">
                                <Label htmlFor="attachment">PDF Attachment (leave empty to keep current)</Label>
                                <input
                                    id="attachment"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setData('attachment', e.target.files[0])}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                                <InputError message={errors.attachment} />
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Idea'}
                                </Button>
                                <Link href={idea.show(idea.slug).url}>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

IdeaEdit.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: idea.index(),
        },
        {
            title: 'Edit Idea',
            href: idea.edit({ idea: 0 }),
        },
    ],
};
