import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ideas from '@/routes/ideas';

type IdeaData = {
    slug: string;
    title: string;
    description: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
};

type Props = {
    idea: IdeaData;
};

const EDITABLE_FIELDS: { key: keyof IdeaData; label: string }[] = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'problem_statement', label: 'Problem Statement' },
    { key: 'proposed_solution', label: 'Proposed Solution' },
    { key: 'cost_benefit_analysis', label: 'Cost-Benefit Analysis' },
];

export default function ProposeChanges({ idea }: Props) {
    const [changedFields, setChangedFields] = useState<Set<keyof IdeaData>>(new Set());
    const [values, setValues] = useState<Partial<Record<keyof IdeaData, string>>>({});

    const toggleField = (key: keyof IdeaData) => {
        setChangedFields((prev) => {
            const next = new Set(prev);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
                setValues((v) => ({ ...v, [key]: idea[key] }));
            }

            return next;
        });
    };

    return (
        <>
            <Head title={`Propose Changes - ${idea.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Propose Changes"
                    description={`To: ${idea.title}`}
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            method="post"
                            action={ideas.changes.store(idea.slug)}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Select the fields you want to change, then enter the new values.
                                    </p>

                                    {EDITABLE_FIELDS.map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                                                <input
                                                    type="checkbox"
                                                    checked={changedFields.has(key)}
                                                    onChange={() => toggleField(key)}
                                                    className="h-4 w-4"
                                                />
                                                <span className="text-sm font-medium">{label}</span>
                                            </label>

                                            {changedFields.has(key) && (
                                                <div className="mt-3 space-y-3 pl-9">
                                                    <div className="grid gap-1">
                                                        <Label className="text-xs text-muted-foreground">Current value</Label>
                                                        <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
                                                            {idea[key]}
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor={key}>New value</Label>
                                                        {key === 'title' ? (
                                                            <Input
                                                                id={key}
                                                                name={`changes[${EDITABLE_FIELDS.findIndex((f) => f.key === key)}][new_value]`}
                                                                value={values[key] ?? ''}
                                                                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                                                            />
                                                        ) : (
                                                            <Textarea
                                                                id={key}
                                                                name={`changes[${EDITABLE_FIELDS.findIndex((f) => f.key === key)}][new_value]`}
                                                                rows={4}
                                                                value={values[key] ?? ''}
                                                                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                                                            />
                                                        )}
                                                        <input
                                                            type="hidden"
                                                            name={`changes[${EDITABLE_FIELDS.findIndex((f) => f.key === key)}][field]`}
                                                            value={key}
                                                        />
                                                        <InputError message={(errors as Record<string, string>)[`changes.${EDITABLE_FIELDS.findIndex((f) => f.key === key)}.new_value`]} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notes (optional)</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            rows={3}
                                            placeholder="Explain why these changes are needed..."
                                        />
                                        <InputError message={errors.notes} />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing || changedFields.size === 0}>
                                            {processing ? 'Submitting...' : 'Submit Changes'}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <a href={ideas.changes.index(idea.slug)}>Cancel</a>
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

ProposeChanges.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Propose Changes', href: '#' },
    ],
};
