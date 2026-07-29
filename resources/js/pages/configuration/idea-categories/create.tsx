import { Form, Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ideaCategories from '@/routes/idea-categories';

export default function IdeaCategoryCreate() {
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

    function validate(form: HTMLFormElement): boolean {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};
        if (!(fd.get('name') as string)?.trim()) errs.name = 'Name is required.';
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    }

    return (
        <>
            <Head title="Create Idea Category" />

            <div className="space-y-6">
                <Heading
                    title="Create Idea Category"
                    description="Add a new idea category to the system"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Idea Category Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/idea-categories"
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
                                                placeholder="e.g., Efficiency"
                                            />
                                            <InputError message={allErrors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Optional description of this category"
                                            />
                                            <InputError message={allErrors.description} />
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
                                                {processing ? 'Creating...' : 'Create Idea Category'}
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href={ideaCategories.index()}>Cancel</Link>
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

IdeaCategoryCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Idea Categories', href: '/idea-categories' },
        { title: 'Create', href: '/idea-categories/create' },
    ],
};
