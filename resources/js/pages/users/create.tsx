import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import routes from '@/routes/users';

export default function UserCreate({ roles, regions, contractTypes }: {
    roles: { id: number; name: string }[];
    regions: { id: number; name: string; directorates: { id: number; name: string; departments: { id: number; name: string }[] }[] }[];
    contractTypes: { id: number; name: string }[];
}) {
    const [isStaff, setIsStaff] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [selectedDirectorate, setSelectedDirectorate] = useState<string>('');

    const currentRegion = regions.find((r) => r.id.toString() === selectedRegion);
    const currentDirectorate = currentRegion?.directorates.find((d) => d.id.toString() === selectedDirectorate);

    return (
        <>
            <Head title="Create User" />

            <div className="space-y-6">
                <Heading
                    title="Create User"
                    description="Add a new user with role and staff information"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/users"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" required placeholder="John Doe" />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(leave blank to auto-generate)</span></Label>
                                            <Input id="password" name="password" type="password" placeholder="Min. 8 characters" />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="mobile_number">Mobile Number</Label>
                                            <Input id="mobile_number" name="mobile_number" placeholder="+254 7XX XXX XXX" />
                                            <InputError message={errors.mobile_number} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select name="gender">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.gender} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select name="role">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.name}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.role} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="is_staff"
                                            checked={isStaff}
                                            onCheckedChange={(checked) => setIsStaff(checked === true)}
                                        />
                                        <Label htmlFor="is_staff">This user is a KeNHA staff member</Label>
                                        <input type="hidden" name="is_staff" value={isStaff ? '1' : '0'} />
                                    </div>

                                    {isStaff && (
                                        <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="region_id">Region</Label>
                                                <Select
                                                    value={selectedRegion}
                                                    onValueChange={(value) => {
                                                        setSelectedRegion(value);
                                                        setSelectedDirectorate('');
                                                    }}
                                                    name="region_id"
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select region" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {regions.map((region) => (
                                                            <SelectItem key={region.id} value={region.id.toString()}>
                                                                {region.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.region_id} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="directorate_id">Directorate</Label>
                                                <Select
                                                    value={selectedDirectorate}
                                                    onValueChange={setSelectedDirectorate}
                                                    name="directorate_id"
                                                    disabled={!selectedRegion}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectedRegion ? 'Select directorate' : 'Select region first'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {currentRegion?.directorates.map((dir) => (
                                                            <SelectItem key={dir.id} value={dir.id.toString()}>
                                                                {dir.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.directorate_id} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="department_id">Department</Label>
                                                <Select name="department_id" disabled={!selectedDirectorate}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectedDirectorate ? 'Select department' : 'Select directorate first'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {currentDirectorate?.departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.department_id} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="contract_type_id">Contract Type</Label>
                                                <Select name="contract_type_id">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select contract type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {contractTypes.map((ct) => (
                                                            <SelectItem key={ct.id} value={ct.id.toString()}>
                                                                {ct.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.contract_type_id} />
                                            </div>

                                            <div className="grid gap-2 col-span-2">
                                                <Label htmlFor="designation">Designation</Label>
                                                <Input id="designation" name="designation" placeholder="e.g., Senior Engineer" />
                                                <InputError message={errors.designation} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create User'}
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

UserCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'User Management', href: '/users' },
        { title: 'Create', href: '/users/create' },
    ],
};
