import { Form, Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import routes from '@/routes/roles';

export default function RoleEdit({
    role,
    permissions,
}: {
    role: {
        id: number;
        name: string;
        guard_name: string;
        is_protected: boolean;
        permission_names: string[];
    };
    permissions: { id: number; name: string }[];
}) {
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
            <Head title={`Edit Role: ${role.name}`} />

            <div className="space-y-6">
                <Heading
                    title={`Edit Role: ${role.name}`}
                    description="Update role name and permissions"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Role Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="put"
                            action={`/roles/${role.id}`}
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
                                            defaultValue={role.name}
                                            disabled={role.is_protected}
                                        />
                                        {role.is_protected && (
                                            <p className="text-xs text-muted-foreground">
                                                The name of this role cannot be changed.
                                            </p>
                                        )}
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
                                                                defaultChecked={role.permission_names.includes(perm.name)}
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
                                            {processing ? 'Saving...' : 'Save Changes'}
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


