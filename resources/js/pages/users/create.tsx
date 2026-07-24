import { Form, Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PhoneInput from '@/components/phone-input';
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
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [selectedDirectorate, setSelectedDirectorate] = useState<string>('');

    const currentRegion = regions.find((r) => r.id.toString() === selectedRegion);
    const currentDirectorate = currentRegion?.directorates.find((d) => d.id.toString() === selectedDirectorate);

    const validate = (form: HTMLFormElement): boolean => {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        const name = (fd.get('name') as string)?.trim();
        if (!name) errs.name = 'Name is required.';

        const email = (fd.get('email') as string)?.trim();
        if (!email) errs.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';

        const password = (fd.get('password') as string);
        if (password && password.length < 8) errs.password = 'Password must be at least 8 characters.';

        const mobile = (fd.get('mobile_number') as string)?.trim();
        if (mobile && !/^\+254\d{9}$/.test(mobile)) errs.mobile_number = 'Enter a valid 9-digit phone number.';

        const role = (fd.get('role') as string);
        if (!role) errs.role = 'Role is required.';

        const isStaffValue = fd.get('is_staff') === '1';
        if (isStaffValue) {
            if (!fd.get('region_id')) errs.region_id = 'Region is required.';
            if (!fd.get('directorate_id')) errs.directorate_id = 'Directorate is required.';
            if (!fd.get('department_id')) errs.department_id = 'Department is required.';
            if (!fd.get('contract_type_id')) errs.contract_type_id = 'Contract type is required.';
            if (!(fd.get('designation') as string)?.trim()) errs.designation = 'Designation is required.';
        }

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

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
                            ref={formRef}
                            className="space-y-6"
                            onSubmit={(e) => {
                                setClientErrors({});
                                if (!validate(e.currentTarget)) e.preventDefault();
                            }}
                        >
                            {({ processing, errors }) => {
                                const allErrors = { ...clientErrors, ...errors };
                                return (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" placeholder="John Doe" />
                                            <InputError message={allErrors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" name="email" type="email" placeholder="john@example.com" />
                                            <InputError message={allErrors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(leave blank to auto-generate)</span></Label>
                                            <PasswordInput id="password" name="password" placeholder="Min. 8 characters" />
                                            <InputError message={allErrors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="mobile_number">Mobile Number</Label>
                                            <PhoneInput name="mobile_number" placeholder="712345678" />
                                            <InputError message={allErrors.mobile_number} />
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
                                            <InputError message={allErrors.gender} />
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
                                            <InputError message={allErrors.role} />
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
                                                <InputError message={allErrors.region_id} />
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
                                                <InputError message={allErrors.directorate_id} />
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
                                                <InputError message={allErrors.department_id} />
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
                                                <InputError message={allErrors.contract_type_id} />
                                            </div>

                                            <div className="grid gap-2 col-span-2">
                                                <Label htmlFor="designation">Designation</Label>
                                                <Input id="designation" name="designation" placeholder="e.g., Senior Engineer" />
                                                <InputError message={allErrors.designation} />
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
                            );
                            }}
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
