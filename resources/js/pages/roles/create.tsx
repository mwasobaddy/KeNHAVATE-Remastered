import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import routes from '@/routes/roles';

export default function RoleCreate({ permissions }: { permissions: { id: number; name: string }[] }) {
    const groupedPermissions = permissions.reduce<Record<string, { id: number; name: string }[]>>((acc, p) => {
        const group = p.name.split('.')[0];

        if (!acc[group]) {
acc[group] = [];
}

        acc[group].push(p);

        return acc;
    }, {});

    return (
        <>
            <Head title="Create Role" />

            <div className="space-y-6">
                <Heading
                    title="Create Role"
                    description="Define a new role with specific permissions"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Role Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/roles"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Role Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="e.g., moderator"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-base font-medium">Permissions</Label>
                                        {Object.entries(groupedPermissions).map(([group, perms]) => (
                                            <div key={group} className="space-y-2">
                                                <Label className="text-sm font-medium capitalize text-muted-foreground">{group}</Label>
                                                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                                                    {perms.map((perm) => (
                                                        <label
                                                            key={perm.id}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <Checkbox
                                                                name="permissions[]"
                                                                value={perm.name}
                                                            />
                                                            <span>{perm.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create Role'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={routes.index()}>Cancel</Link>
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

RoleCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Role Management', href: '/roles' },
        { title: 'Create', href: '/roles/create' },
    ],
};
