import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import routes from '@/routes/users';

export default function UserEdit({ user, roles, regions, contractTypes }: {
    user: {
        id: number;
        name: string;
        email: string;
        mobile_number: string | null;
        gender: string | null;
        role: string;
        is_staff: boolean;
        staff: { region_id: number | null; directorate_id: number | null; department_id: number | null; contract_type_id: number | null; designation: string | null } | null;
    };
    roles: { id: number; name: string }[];
    regions: { id: number; name: string; directorates: { id: number; name: string; departments: { id: number; name: string }[] }[] }[];
    contractTypes: { id: number; name: string }[];
}) {
    const [isStaff, setIsStaff] = useState(user.is_staff);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [tipBack, setTipBack] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedRegion, setSelectedRegion] = useState(user.staff?.region_id?.toString() ?? '');
    const [selectedDirectorate, setSelectedDirectorate] = useState(user.staff?.directorate_id?.toString() ?? '');

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const currentRegion = regions.find((r) => r.id.toString() === selectedRegion);
    const currentDirectorate = currentRegion?.directorates.find((d) => d.id.toString() === selectedDirectorate);

    const validate = (form: HTMLFormElement): boolean => {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        const name = (fd.get('name') as string)?.trim();

        if (!name) {
errs.name = 'Name is required.';
}

        const email = (fd.get('email') as string)?.trim();

        if (!email) {
errs.email = 'Email is required.';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
errs.email = 'Enter a valid email address.';
}

        const password = (fd.get('password') as string);

        if (password && password.length < 8) {
errs.password = 'Password must be at least 8 characters.';
}

        const mobile = (fd.get('mobile_number') as string)?.trim();

        if (mobile && !/^\+254\d{9}$/.test(mobile)) {
errs.mobile_number = 'Enter a valid 9-digit phone number.';
}

        const role = (fd.get('role') as string);

        if (!role) {
errs.role = 'Role is required.';
}

        const isStaffValue = fd.get('is_staff') === '1';

        if (isStaffValue) {
            if (!fd.get('region_id')) {
errs.region_id = 'Region is required.';
}

            if (!fd.get('directorate_id')) {
errs.directorate_id = 'Directorate is required.';
}

            if (!fd.get('department_id')) {
errs.department_id = 'Department is required.';
}

            if (!fd.get('contract_type_id')) {
errs.contract_type_id = 'Contract type is required.';
}

            if (!(fd.get('designation') as string)?.trim()) {
errs.designation = 'Designation is required.';
}
        }

        setClientErrors(errs);

        return Object.keys(errs).length === 0;
    };

    return (
        <>
            <Head title={`Edit User: ${user.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <Tooltip open={tipBack} onOpenChange={setTipBack}>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="warning" onClick={() => {
 setTipBack(true); goBack(); 
}}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Back</TooltipContent>
                        </Tooltip>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                    <Heading
                        title={`Edit User: ${user.name}`}
                        description="Update user details, role, and staff information"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="put"
                            action={`/users/${user.id}`}
                            ref={formRef}
                            className="space-y-6"
                            onSubmit={(e) => {
                                setClientErrors({});

                                if (!validate(e.currentTarget)) {
e.preventDefault();
}
                            }}
                        >
                            {({ processing, errors }) => {
                                const allErrors = { ...clientErrors, ...errors };

                                return (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" defaultValue={user.name} />
                                            <InputError message={allErrors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" name="email" type="email" defaultValue={user.email} />
                                            <InputError message={allErrors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">New Password <span className="text-xs text-muted-foreground">(leave blank to keep current)</span></Label>
                                            <PasswordInput id="password" name="password" placeholder="Min. 8 characters" />
                                            <InputError message={allErrors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="mobile_number">Mobile Number</Label>
                                            <PhoneInput name="mobile_number" defaultValue={user.mobile_number ?? ''} placeholder="712345678" />
                                            <InputError message={allErrors.mobile_number} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select name="gender" defaultValue={user.gender ?? ''}>
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
                                            <Select name="role" defaultValue={user.role}>
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
                                                <Select name="department_id" defaultValue={user.staff?.department_id?.toString() ?? ''} disabled={!selectedDirectorate}>
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
                                                <Select name="contract_type_id" defaultValue={user.staff?.contract_type_id?.toString() ?? ''}>
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
                                                <Input id="designation" name="designation" defaultValue={user.staff?.designation ?? ''} />
                                                <InputError message={allErrors.designation} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Changes'}
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


