import { Head, Link, useForm } from '@inertiajs/react';
import { Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import idea from '@/routes/idea';

interface CurrentUser {
    name: string;
    email: string | null;
    work_email: string | null;
}

export default function IdeaCreate({ thematicAreas, currentUser }: { thematicAreas: any[]; currentUser: CurrentUser }) {
    const { data, setData, post, processing, errors } = useForm({
        idea_title: '',
        thematic_area_id: '',
        abstract: '',
        problem_statement: '',
        proposed_solution: '',
        cost_benefit_analysis: '',
        declaration_of_interests: '',
        original_idea_disclaimer: false,
        collaboration_enabled: false,
        team_effort: false,
        comments_enabled: false,
        attachment: undefined as File | undefined,
        team_members: [],
    });

    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        role: '',
        permission: 'view',
    });
    const [duplicateError, setDuplicateError] = useState('');

    const [showPublicWarning, setShowPublicWarning] = useState(false);

    const handleCollaborationChange = (checked: boolean) => {
        setData('collaboration_enabled', checked);

        if (!checked) {
            setData('comments_enabled', false);
        }

        if (checked) {
            setShowPublicWarning(true);
        }
    };


// Define TeamMember type at the top level (outside the component)
type TeamMember = {
    name: string;
    email: string;
    role: string;
    permission: string;
};

    const addTeamMember = () => {

        setDuplicateError('');

        if (!newMember.name || !newMember.email) {
            return;
        }

        // Check for duplicate email
        const isDuplicate = ((data.team_members as TeamMember[]) || []).some(
            (member) => member.email.toLowerCase() === newMember.email.toLowerCase()
        );

        if (isDuplicate) {
            setDuplicateError('This email has already been added to the team.');

            return;
        }

        setData('team_members', [
            ...(((data.team_members as TeamMember[]) || [])),
            { ...newMember } as TeamMember
        ] as TeamMember[] as any);
        setNewMember({ name: '', email: '', role: '', permission: 'view' });
    };

    const removeTeamMember = (index: number) => {
        setData('team_members', ((data.team_members as TeamMember[]) || []).filter((_, i) => i !== index) as TeamMember[] as any);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData();

        // Append all data fields
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'attachment' && value instanceof File) {
                formData.append('attachment', value);
            } else if (key === 'team_members' && Array.isArray(value)) {
                // Handle team_members array
                value.forEach((member: any, index: number) => {
                    formData.append(`team_members[${index}][name]`, member.name || '');
                    formData.append(`team_members[${index}][email]`, member.email || '');
                    formData.append(`team_members[${index}][role]`, member.role || '');
                    formData.append(`team_members[${index}][permission]`, member.permission || 'view');
                });
            } else if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            } else if (value !== null && value !== undefined && key !== 'attachment') {
                formData.append(key, String(value));
            }
        });

        post(idea.store().url, {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Create Idea" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">Create New Idea</h1>
                        <p className="mt-2 text-muted-foreground">Submit a new idea for consideration</p>

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            {/* Idea Title */}
                            <div className="grid gap-2">
                                <Label htmlFor="idea_title">Idea Title *</Label>
                                <Input
                                    id="idea_title"
                                    value={data.idea_title}
                                    onChange={(e) => setData('idea_title', e.target.value)}
                                />
                                <InputError message={errors.idea_title} />
                            </div>

                            {/* Thematic Area */}
                            <div className="grid gap-2">
                                <Label htmlFor="thematic_area_id">Thematic Area *</Label>
                                <Select
                                    value={data.thematic_area_id}
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
                                />
                                <InputError message={errors.declaration_of_interests} />
                            </div>

                            {/* Original Idea Disclaimer */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="original_idea_disclaimer"
                                    checked={data.original_idea_disclaimer}
                                    onCheckedChange={(checked) => setData('original_idea_disclaimer', Boolean(checked))}
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
                                    onCheckedChange={handleCollaborationChange}
                                />
                                <Label htmlFor="collaboration_enabled">
                                    Enable collaboration (make idea public)
                                </Label>
                                <InputError message={errors.collaboration_enabled} />
                            </div>

                            {/* Public Warning Modal */}
                            {showPublicWarning && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                    <div className="rounded-lg bg-white p-6 max-w-md">
                                        <h3 className="text-lg font-bold">Warning</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Ideas without IP protection might be stolen by other people if placed publicly. 
                                            Consider protecting your idea before making it public.
                                        </p>
                                        <div className="mt-4 flex justify-end">
                                            <Button onClick={() => setShowPublicWarning(false)}>
                                                I Understand
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Comments Enabled - only if collaboration is enabled */}
                            {data.collaboration_enabled && (
                                <div className="ml-6 flex items-center space-x-3">
                                    <Checkbox
                                        id="comments_enabled"
                                        checked={data.comments_enabled}
                                        onCheckedChange={(checked) => setData('comments_enabled', checked === true)}
                                    />
                                    <Label htmlFor="comments_enabled">
                                        Enable comments
                                    </Label>
                                    <InputError message={errors.comments_enabled} />
                                </div>
                            )}

                            {/* Team Effort */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="team_effort"
                                    checked={data.team_effort}
                                    onCheckedChange={(checked) => setData('team_effort', checked === true)}
                                />
                                <Label htmlFor="team_effort" className="after:ml-0.5 after:text-red-500 after:content-['*']">
                                    This is a team effort - other members were involved
                                </Label>
                                <InputError message={errors.team_effort} />
                            </div>

                            {/* Team Members Section - only if team_effort is checked */}
                            {data.team_effort && (
                                <div className="ml-6 space-y-4 rounded-lg border p-4">
                                    <h3 className="text-lg font-semibold">Team Members</h3>

                                    {/* Warning about adding themselves */}
                                    <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-3">
                                        <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
                                        <div className="text-sm">
                                            <p className="font-medium text-yellow-800">Important:</p>
                                            <p className="text-yellow-700">
                                                You must add yourself as a team member. 
                                                {currentUser && `Use: ${currentUser.name}, ${currentUser.email || currentUser.work_email}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Add New Member Form */}
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="member_name">Name *</Label>
                                                <Input
                                                    id="member_name"
                                                    value={newMember.name}
                                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                                    placeholder="Full name"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="member_email">Email *</Label>
                                                <Input
                                                    id="member_email"
                                                    type="email"
                                                    value={newMember.email}
                                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="member_role">Role</Label>
                                                <Input
                                                    id="member_role"
                                                    value={newMember.role}
                                                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                                    placeholder="e.g., Researcher, Team Leader"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="member_permission">Permission</Label>
                                                <Select
                                                    value={newMember.permission}
                                                    onValueChange={(value) => setNewMember({ ...newMember, permission: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="view">Can View</SelectItem>
                                                        <SelectItem value="edit">Can Edit</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addTeamMember}
                                            disabled={!newMember.name || !newMember.email}
                                        >
                                            Add Member
                                        </Button>
                                        {duplicateError && (
                                            <p className="text-sm text-red-600">{duplicateError}</p>
                                        )}
                                    </div>

                                    {/* List of Added Members */}
                                    {data.team_members.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Added Members:</h4>
                                            {(data.team_members as Array<{ name: string; email: string; role?: string; permission: string }> ).map((member, index) => (
                                                <div key={index} className="flex items-center justify-between rounded-md bg-muted p-3">
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {member.role && `${member.role} • `}
                                                            {member.permission === 'edit' ? 'Can Edit' : 'Can View'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeTeamMember(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <InputError message={errors.team_members} />
                                </div>
                            )}

                            {/* PDF Attachment */}
                            <div className="grid gap-2">
                                <Label htmlFor="attachment">PDF Attachment *</Label>
                                    <Input
                                        id="attachment"
                                        name="attachment"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setData('attachment', file || undefined);
                                        }}
                                    />
                                <InputError message={errors.attachment} />
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Idea'}
                                </Button>
                                <Link href={idea.index()}>
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

IdeaCreate.layout = {
    breadcrumbs: [
        {
            title: 'Ideas',
            href: idea.index(),
        },
        {
            title: 'Create Idea',
            href: idea.create(),
        },
    ],
};
