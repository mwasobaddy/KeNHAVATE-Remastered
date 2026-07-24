import { Form, Head, Link } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useRef, useState } from 'react';
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

export default function RoleCreate({ permissions }: { permissions: Permission[] }) {
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

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

    function validate(form: HTMLFormElement): boolean {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};
        if (!(fd.get('name') as string)?.trim()) errs.name = 'Role name is required.';
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    }

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
                                            <Label htmlFor="name">Role Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="e.g., moderator"
                                            />
                                            <InputError message={allErrors.name} />
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
                                            {processing ? 'Creating...' : 'Create Role'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={routes.index()}>Cancel</Link>
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

RoleCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Role Management', href: '/roles' },
        { title: 'Create', href: '/roles/create' },
    ],
};
