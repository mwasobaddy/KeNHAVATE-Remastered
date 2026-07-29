import { Form, Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import directorates from '@/routes/directorates';

type Props = {
    regions: { id: number; name: string; code: string }[];
};

export default function DirectorateCreate({ regions }: Props) {
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

    function validate(form: HTMLFormElement): boolean {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};
        if (!(fd.get('name') as string)?.trim()) errs.name = 'Name is required.';
        if (!(fd.get('code') as string)?.trim()) errs.code = 'Code is required.';
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    }

    return (
        <>
            <Head title="Create Directorate" />

            <div className="space-y-6">
                <Heading
                    title="Create Directorate"
                    description="Add a new directorate to the system"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Directorate Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/directorates"
                            className="space-y-6"
                            ref={formRef}
                            onSubmit={(e) => {
                                setClientErrors({});
                                if (!validate(e.currentTarget)) e.preventDefault();
                            }}
                        >
                            {({ processing, errors }) => {
                                const allErrors = { ...clientErrors, ...errors };
                                return (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="e.g., Infrastructure"
                                            />
                                            <InputError message={allErrors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="code">Code</Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                placeholder="e.g., INFRA"
                                            />
                                            <InputError message={allErrors.code} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Optional description of this directorate"
                                            />
                                            <InputError message={allErrors.description} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="region_id">Region</Label>
                                            <select
                                                id="region_id"
                                                name="region_id"
                                                className="rounded-md border border-input bg-background px-3 py-2"
                                            >
                                                <option value="">Select a region</option>
                                                {regions.map((region) => (
                                                    <option key={region.id} value={region.id}>
                                                        {region.name} ({region.code})
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={allErrors.region_id} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                id="is_active"
                                                name="is_active"
                                                type="checkbox"
                                                value="1"
                                                defaultChecked
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="is_active">Active</Label>
                                        </div>
                                        <InputError message={allErrors.is_active} />

                                        <div className="flex items-center gap-4">
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Creating...' : 'Create Directorate'}
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href={directorates.index()}>Cancel</Link>
                                            </Button>
                                        </div>
                                    </>
                                );
                            }}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DirectorateCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Directorates', href: '/directorates' },
        { title: 'Create', href: '/directorates/create' },
    ],
};
