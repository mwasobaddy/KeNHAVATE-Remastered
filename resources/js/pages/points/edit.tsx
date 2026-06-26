import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import points from '@/routes/points';

type Props = {
    point: {
        id: number;
        name: string;
        description: string | null;
        points: number;
    };
};

export default function PointEdit({ point }: Props) {
    return (
        <>
            <Head title="Edit Point Action" />

            <div className="space-y-6">
                <Heading
                    title="Edit Point Action"
                    description={`Update "${point.name}"`}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Point Action Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="put"
                            action={`/points/${point.id}`}
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
                                            defaultValue={point.name}
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
                                            defaultValue={point.description ?? ''}
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
                                            defaultValue={point.points}
                                        />
                                        <InputError message={errors.points} />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Changes'}
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

PointEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Point Actions', href: '/points' },
        { title: 'Edit', href: `/points/${point.id}/edit` },
    ],
};
