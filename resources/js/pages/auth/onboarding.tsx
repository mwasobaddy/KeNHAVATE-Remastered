import { Form, Head } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, User } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PhoneInput from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    prefill: {
        first_name: string;
        other_names: string;
        mobile_number: string;
        gender: string;
    };
    has_password: boolean;
};

const steps = [
    {
        number: 0,
        title: 'Staff Status',
        description: 'Confirm your employment status',
        icon: BadgeCheck,
    },
    {
        number: 1,
        title: 'Profile Setup',
        description: 'Complete your personal details',
        icon: User,
    },
];

export default function Onboarding({ regions, contractTypes, login_email, auto_staff, prefill, has_password }: Props) {
    const [showDialog, setShowDialog] = useState(true);
    const [isStaff, setIsStaff] = useState<boolean | null>(auto_staff ? true : null);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

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

    const validate = (form: HTMLFormElement): boolean => {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        const firstName = (fd.get('first_name') as string)?.trim();
        if (!firstName) errs.first_name = 'First name is required.';

        const mobile = (fd.get('mobile_number') as string)?.trim();
        if (!mobile) errs.mobile_number = 'Mobile number is required.';
        else if (!/^\+254\d{9}$/.test(mobile)) errs.mobile_number = 'Enter a valid 9-digit phone number.';

        const emailInput = form.querySelector<HTMLInputElement>('[name="email"]');
        const email = (fd.get('email') as string)?.trim();
        if (emailInput && !emailInput.disabled && !email) errs.email = 'Email is required.';
        else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';

        const gender = (fd.get('gender') as string);
        if (!gender) errs.gender = 'Gender is required.';

        const password = (fd.get('password') as string);
        if (!has_password && !password) {
            errs.password = 'Password is required.';
        } else if (password && password.length < 8) {
            errs.password = 'Password must be at least 8 characters.';
        }

        const confirmation = (fd.get('password_confirmation') as string);
        if (password) {
            if (!confirmation) errs.password_confirmation = 'Please confirm your password.';
            else if (confirmation !== password) errs.password_confirmation = 'Passwords do not match.';
        }

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

    const handleStaffAnswer = (answer: boolean) => {
        setIsStaff(answer);
        setShowDialog(false);
    };

    const shouldShowStaff = auto_staff || isStaff === true;
    const currentStep = isStaff !== null ? 1 : 0;

    return (
        <div className="min-h-screen bg-zinc-50 py-8 px-4 dark:bg-neutral-900">
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

            <div className="mx-auto grid max-w-7xl grid-cols-7 gap-8">
                {/* Left Panel — Welcome + Step Indicators */}
                <Card className="hidden rounded-xl border bg-linear-to-t from-beige to-yellow/5 p-8 shadow-xl lg:col-span-3 lg:sticky lg:top-24 lg:h-fit lg:block dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800">
                    <div className="mb-10 flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow shadow-lg">
                            <BadgeCheck className="h-5 w-5 text-black" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Welcome aboard!</h1>
                            <p className="text-sm text-muted-foreground">
                                Set up your account to get started
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Complete your profile to join the Innovation Portal
                            </p>
                        </div>
                    </div>

                    <div className="max-w-3xl">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isStepActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <div key={step.number} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={isCompleted ? 'rounded-full bg-yellow/15 p-1.5 transition-all' : 'p-1.5'}>
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                                                    isStepActive
                                                        ? 'border-2 border-yellow bg-white text-yellow shadow-lg'
                                                        : isCompleted
                                                        ? 'bg-yellow text-black'
                                                        : 'border-2 border-gray-300 bg-white text-gray-400'
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-6 w-6" />
                                                ) : (
                                                    <Icon className="h-6 w-6" />
                                                )}
                                            </div>
                                        </div>

                                        {index < steps.length - 1 && (
                                            <div className="w-0.5 flex-1">
                                                <div
                                                    className={`h-full w-full transition-all ${
                                                        isCompleted
                                                            ? 'bg-yellow'
                                                            : 'border-dashed border-l-2 border-gray-300'
                                                    }`}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 pb-16">
                                        <h3 className="text-lg font-bold">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Right Panel — Form Content */}
                <Card className="col-span-7 border-0 bg-transparent shadow-none lg:col-span-4">
                    <CardHeader>
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-yellow">
                            Step {currentStep + 1} of {steps.length}
                        </p>
                        <CardTitle className="text-2xl">
                            {steps[currentStep].title}
                        </CardTitle>
                        <div className="mb-2 h-1 w-24 rounded-full bg-linear-to-r from-yellow to-black" />
                        <CardDescription>
                            {steps[currentStep].description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isStaff !== null ? (
                            <Form
                                method="post"
                                action="/onboarding"
                                ref={formRef}
                                className="flex flex-col gap-6"
                                onSubmit={(e) => {
                                    if (!validate(e.currentTarget)) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                {({ processing, errors }) => {
                                    const allErrors = { ...clientErrors, ...errors };
                                    return (
                                        <>
                                            <input type="hidden" name="is_staff" value={shouldShowStaff ? '1' : '0'} />

                                            {!auto_staff && (
                                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                    <span>
                                                        {isStaff
                                                            ? 'Signed in as KeNHA Staff'
                                                            : 'Signed in as Non-Staff'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDialog(true)}
                                                        className="cursor-pointer font-medium text-yellow underline decoration-yellow/40 underline-offset-2 transition-colors hover:decoration-yellow/80"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Personal Information
                                                </h3>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="first_name">First Name</Label>
                                                    <Input id="first_name" name="first_name" placeholder="Enter your first name" defaultValue={prefill.first_name} />
                                                    <InputError message={allErrors.first_name} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="other_names">Other Names</Label>
                                                    <Input id="other_names" name="other_names" placeholder="Enter your other names" defaultValue={prefill.other_names} />
                                                    <InputError message={allErrors.other_names} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="mobile_number">Mobile Number</Label>
                                                    <PhoneInput name="mobile_number" placeholder="712345678" defaultValue={prefill.mobile_number} />
                                                    <InputError message={allErrors.mobile_number} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        placeholder="personal@example.com"
                                                        defaultValue={login_email ?? ''}
                                                        disabled={!!login_email}
                                                    />
                                                    <InputError message={allErrors.email} />
                                                    {login_email && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Signed in with this email — it cannot be changed here.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="gender">Gender</Label>
                                                    <Select name="gender" defaultValue={prefill.gender || undefined}>
                                                        <SelectTrigger id="gender">
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
                                                    <Label htmlFor="password">Password</Label>
                                                    <PasswordInput id="password" name="password" placeholder={has_password ? 'Leave blank to keep current password' : 'Create a password'} />
                                                    <InputError message={allErrors.password} />
                                                    {has_password && (
                                                        <p className="text-xs text-muted-foreground">Leave blank to keep your existing password.</p>
                                                    )}
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                                    <PasswordInput id="password_confirmation" name="password_confirmation" placeholder="Confirm your password" />
                                                    <InputError message={allErrors.password_confirmation} />
                                                </div>
                                            </div>

                                            {shouldShowStaff && (
                                                <div className="space-y-4 border-t pt-4">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                                                        <InputError message={allErrors.region_id} />
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
                                                        <InputError message={allErrors.directorate_id} />
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
                                                        <InputError message={allErrors.department_id} />
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
                                                        <InputError message={allErrors.contract_type_id} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="designation">Designation</Label>
                                                        <Input id="designation" name="designation" placeholder="Enter your job title" />
                                                        <InputError message={allErrors.designation} />
                                                    </div>
                                                </div>
                                            )}

                                            <Button type="submit" className="w-full" disabled={processing}>
                                                {processing ? 'Saving...' : 'Complete Setup'}
                                            </Button>
                                        </>
                                    );
                                }}
                            </Form>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow/10">
                                    <BadgeCheck className="h-8 w-8 text-yellow" />
                                </div>
                                <p className="text-lg font-medium">Waiting for your response</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Please answer the question above to continue setting up your profile.
                                </p>
                            </div>
                        )}

                        <div className="mt-6 text-center text-sm text-gray-500">
                            Need help?{' '}
                            <a href="mailto:support@kenha.co.ke" className="text-yellow underline decoration-yellow/30 underline-offset-2 transition-colors hover:decoration-yellow/60">
                                Contact support
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Onboarding.layout = {};
