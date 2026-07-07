import { Form, Head, Link } from '@inertiajs/react';
import { Info } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import routes from '@/routes/roles';

type Permission = { id: number; name: string; description: string | null };

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
    permissions: Permission[];
}) {
    const createPermission = permissions.find((p) => p.name === 'idea.create');
    const selectablePermissions = permissions.filter((p) => p.name !== 'idea.create');

    const groupedPermissions = selectablePermissions.reduce<Record<string, Permission[]>>((acc, p) => {
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

                                        {createPermission && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium capitalize text-muted-foreground">Required</Label>
                                                <div className="rounded-lg border p-3">
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <Checkbox
                                                            name="permissions[]"
                                                            value={createPermission.name}
                                                            checked
                                                            disabled
                                                            className="cursor-not-allowed opacity-60"
                                                        />
                                                        <span className="text-muted-foreground">{createPermission.name}</span>
                                                        {createPermission.description && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button type="button" className="inline-flex cursor-help">
                                                                        <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-xs">
                                                                    <p className="text-xs">{createPermission.description}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        )}

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
                                                            {perm.description && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button type="button" className="inline-flex cursor-help">
                                                                            <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" className="max-w-xs">
                                                                        <p className="text-xs">{perm.description}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
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
