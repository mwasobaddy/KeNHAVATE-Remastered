import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import points from '@/routes/points';

export default function PointCreate() {
    return (
        <>
            <Head title="Create Point Action" />

            <div className="space-y-6">
                <Heading
                    title="Create Point Action"
                    description="Define a new action that awards points to users"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Point Action Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/points"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="e.g., Submit Idea"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Optional description of this action"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="points">
                                            Points to Award
                                        </Label>
                                        <Input
                                            id="points"
                                            name="points"
                                            type="number"
                                            min={1}
                                            required
                                            placeholder="e.g., 50"
                                        />
                                        <InputError message={errors.points} />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create Point Action'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={points.index()}>Cancel</Link>
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

PointCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Point Actions', href: '/points' },
        { title: 'Create', href: '/points/create' },
    ],
};
