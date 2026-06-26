import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';

type Region = {
    id: number;
    name: string;
    directorates: {
        id: number;
        name: string;
        departments: { id: number; name: string }[];
    }[];
};

type ContractType = {
    id: number;
    name: string;
};

type Props = {
    regions: Region[];
    contractTypes: ContractType[];
    login_email: string | null;
    auto_staff: boolean;
};

export default function Onboarding({ regions, contractTypes, login_email, auto_staff }: Props) {
    const [showDialog, setShowDialog] = useState(true);
    const [isStaff, setIsStaff] = useState<boolean | null>(auto_staff ? true : null);

    const [selectedRegionId, setSelectedRegionId] = useState<string>('');
    const [selectedDirectorateId, setSelectedDirectorateId] = useState<string>('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [selectedContractTypeId, setSelectedContractTypeId] = useState<string>('');

    const selectedRegion = regions.find((r) => String(r.id) === selectedRegionId);
    const directorates = selectedRegion?.directorates ?? [];
    const selectedDirectorate = directorates.find(
        (d) => String(d.id) === selectedDirectorateId,
    );
    const departments = selectedDirectorate?.departments ?? [];

    const handleStaffAnswer = (answer: boolean) => {
        setIsStaff(answer);
        setShowDialog(false);
    };

    const shouldShowStaff = auto_staff || isStaff === true;

    return (
        <AuthCardLayout title="Complete Your Profile" description="Set up your account to get started.">
            <Head title="Onboarding" />

            {!auto_staff && (
                <Dialog
                    open={showDialog}
                    onOpenChange={(open) => {
                        if (!open && isStaff === null) {
                            return;
                        }

                        setShowDialog(open);
                    }}
                >
                    <DialogContent
                        className="sm:max-w-md"
                        onInteractOutside={(e) => e.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl">
                                Are you a KeNHA Staff?
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                This helps us tailor your experience on the Innovation Portal.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center gap-4 pt-2">
                            <Button
                                type="button"
                                variant="default"
                                size="lg"
                                className="w-32"
                                onClick={() => handleStaffAnswer(true)}
                            >
                                Yes
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="w-32"
                                onClick={() => handleStaffAnswer(false)}
                            >
                                No
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {isStaff !== null && (
                <Form
                    method="post"
                    action="/onboarding"
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="is_staff" value={shouldShowStaff ? '1' : '0'} />

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Personal Information
                                </h3>

                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" name="first_name" required placeholder="Enter your first name" />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="other_names">Other Names</Label>
                                    <Input id="other_names" name="other_names" placeholder="Enter your other names" />
                                    <InputError message={errors.other_names} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="mobile_number">Mobile Number</Label>
                                    <Input id="mobile_number" name="mobile_number" required placeholder="+254712345678" />
                                    <InputError message={errors.mobile_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder={login_email ? 'personal@example.com' : 'personal@example.com'}
                                        defaultValue={login_email ?? ''}
                                        disabled={!!login_email}
                                    />
                                    <InputError message={errors.email} />
                                    {login_email && (
                                        <p className="text-xs text-muted-foreground">
                                            Signed in with this email — it cannot be changed here.
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        required
                                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <InputError message={errors.gender} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput id="password" name="password" required placeholder="Create a password" />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <PasswordInput id="password_confirmation" name="password_confirmation" required placeholder="Confirm your password" />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            {shouldShowStaff && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Staff Information
                                    </h3>

                                    <input type="hidden" name="region_id" value={selectedRegionId} />
                                    <input type="hidden" name="directorate_id" value={selectedDirectorateId} />
                                    <input type="hidden" name="department_id" value={selectedDepartmentId} />
                                    <input type="hidden" name="contract_type_id" value={selectedContractTypeId} />

                                    <div className="grid gap-2">
                                        <Label>Region</Label>
                                        <Select
                                            value={selectedRegionId}
                                            onValueChange={(value) => {
                                                setSelectedRegionId(value);
                                                setSelectedDirectorateId('');
                                                setSelectedDepartmentId('');
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regions.map((region) => (
                                                    <SelectItem key={region.id} value={String(region.id)}>
                                                        {region.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.region_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Directorate</Label>
                                        <Select
                                            value={selectedDirectorateId}
                                            onValueChange={(value) => {
                                                setSelectedDirectorateId(value);
                                                setSelectedDepartmentId('');
                                            }}
                                            disabled={!selectedRegionId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select directorate" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {directorates.map((directorate) => (
                                                    <SelectItem key={directorate.id} value={String(directorate.id)}>
                                                        {directorate.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.directorate_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Department</Label>
                                        <Select
                                            value={selectedDepartmentId}
                                            onValueChange={setSelectedDepartmentId}
                                            disabled={!selectedDirectorateId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((department) => (
                                                    <SelectItem key={department.id} value={String(department.id)}>
                                                        {department.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.department_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Contract Type</Label>
                                        <Select
                                            value={selectedContractTypeId}
                                            onValueChange={setSelectedContractTypeId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select contract type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contractTypes.map((type) => (
                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.contract_type_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="designation">Designation</Label>
                                        <Input id="designation" name="designation" placeholder="Enter your job title" />
                                        <InputError message={errors.designation} />
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Saving...' : 'Complete Setup'}
                            </Button>
                        </>
                    )}
                </Form>
            )}
        </AuthCardLayout>
    );
}

Onboarding.layout = {};
