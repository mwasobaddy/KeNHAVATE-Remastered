import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ImageUp,
    Lock,
    Mail,
    MapPin,
    Phone,
    User,
    UserRound,
    Users,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import AppearanceTabs from '@/components/appearance-tabs';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
// import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
// import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';

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

type StaffDetails = {
    region: string | null;
    region_id: number | null;
    directorate: string | null;
    directorate_id: number | null;
    department: string | null;
    department_id: number | null;
    contract_type: string | null;
    contract_type_id: number | null;
    designation: string | null;
};

type AuthUser = {
    name: string;
    email: string;
    email_verified_at: string | null;
    work_email: string | null;
    mobile_number: string | null;
    gender: string | null;
    avatar_url: string | null;
    roles: string[];
    staff: StaffDetails | null;
};

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
    // canManageTwoFactor?: boolean;
    // requiresConfirmation?: boolean;
    // twoFactorEnabled?: boolean;
    activeTab?: string;
    regions: Region[];
    contractTypes: ContractType[];
};

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function Settings({
    mustVerifyEmail,
    status,
    // canManageTwoFactor = false,
    // requiresConfirmation = false,
    // twoFactorEnabled = false,
    activeTab = 'profile',
    regions,
    contractTypes,
}: Props) {
    const { auth } = usePage().props;
    const user = auth.user as AuthUser;
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [tipBack, setTipBack] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    const [staffRegionId, setStaffRegionId] = useState<string>(String(user.staff?.region_id ?? ''));
    const [staffDirectorateId, setStaffDirectorateId] = useState<string>(String(user.staff?.directorate_id ?? ''));
    const [staffDepartmentId, setStaffDepartmentId] = useState<string>(String(user.staff?.department_id ?? ''));

    const selectedRegion = regions.find((r) => String(r.id) === staffRegionId);
    const directorates = selectedRegion?.directorates ?? [];
    const selectedDirectorate = directorates.find((d) => String(d.id) === staffDirectorateId);
    const departments = selectedDirectorate?.departments ?? [];

    const validate = (form: HTMLFormElement): boolean => {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        const name = (fd.get('name') as string)?.trim();

        if (!name) {
            errs.name = 'Name is required.';
        }

        setClientErrors(errs);

        return Object.keys(errs).length === 0;
    };

    return (
        <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <Head title="Settings" />

            <div className="flex flex-col items-start gap-1">
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

            <Tabs value={activeTab} onValueChange={(v) => router.visit(`/settings/${v}`)} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <div>
                    <h1 className="text-2xl font-bold">
                        {activeTab === 'profile' ? 'Profile Settings' : activeTab === 'security' ? 'Security Settings' : 'Appearance Settings'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {activeTab === 'profile'
                            ? 'Manage your profile information and account preferences'
                            : activeTab === 'security'
                                ? 'Manage your account security and destruction'
                                : 'Customize the appearance of your account'}
                    </p>
                </div>

                {/* ────── Profile Tab ────── */}
                <TabsContent value="profile" className="space-y-6">
                    {/* Profile header */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-14 ring-2 ring-border">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="size-full rounded-full object-cover" />
                                    ) : (
                                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                            {initials(user.name)}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="min-w-0 space-y-1">
                                    <p className="text-lg font-semibold leading-tight">{user.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                                    {user.roles && user.roles.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                            {user.roles.map((role) => (
                                                <Badge key={role} variant="secondary" className="font-normal">
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {/* Profile Information card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="size-4 text-muted-foreground" />
                                    Profile information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form
                                    method="put"
                                    action="/user/profile-information"
                                    ref={formRef}
                                    encType="multipart/form-data"
                                    options={{ preserveScroll: true }}
                                    className="space-y-5"
                                    onSubmit={(e) => {
                                        setClientErrors({});

                                        if (!validate(e.currentTarget)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onError={(errors) => {
                                        const msg = errors.name ?? errors.mobile_number ?? errors.gender ?? errors.avatar ?? 'Profile update failed.';
                                        toast.error(msg);
                                    }}
                                >
                                    {({ processing, errors }) => {
                                        const allErrors = { ...clientErrors, ...errors };

                                        return (
                                            <>
                                                {/* Avatar upload */}
                                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                                    <label
                                                        htmlFor="avatar"
                                                        className="group relative cursor-pointer"
                                                    >
                                                        <Avatar className="size-20 ring-2 ring-border transition-shadow group-hover:ring-primary/50">
                                                            {user.avatar_url && !avatarPreview ? (
                                                                <img src={user.avatar_url} alt={user.name} className="size-full rounded-full object-cover" />
                                                            ) : avatarPreview ? (
                                                                <img src={avatarPreview} alt="Preview" className="size-full rounded-full object-cover" />
                                                            ) : (
                                                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                                                                    {initials(user.name)}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <ImageUp className="size-6 text-white" />
                                                        </div>
                                                    </label>
                                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                                        <p className="text-sm font-medium">Profile picture</p>
                                                        <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2MB.</p>
                                                        <Input
                                                            id="avatar"
                                                            name="avatar"
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-1 w-full sm:w-auto"
                                                            onClick={() => document.getElementById('avatar')?.click()}
                                                        >
                                                            Choose image
                                                        </Button>
                                                        <InputError message={allErrors.avatar} />
                                                    </div>
                                                </div>

                                                <div className="grid gap-5 sm:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="name" className="flex items-center gap-2">
                                                            <UserRound className="size-3.5 text-muted-foreground" />
                                                            Full name
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            defaultValue={user.name}
                                                            name="name"
                                                            autoComplete="name"
                                                            placeholder="Full name"
                                                        />
                                                        <InputError message={allErrors.name} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="email" className="flex items-center gap-2">
                                                            <Mail className="size-3.5 text-muted-foreground" />
                                                            Email address
                                                        </Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            defaultValue={user.email}
                                                            disabled
                                                            aria-disabled="true"
                                                            className="bg-muted"
                                                        />
                                                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="mobile_number" className="flex items-center gap-2">
                                                            <Phone className="size-3.5 text-muted-foreground" />
                                                            Mobile number
                                                        </Label>
                                                        <Input
                                                            id="mobile_number"
                                                            defaultValue={user.mobile_number ?? ''}
                                                            name="mobile_number"
                                                            autoComplete="tel"
                                                            placeholder="Mobile number"
                                                        />
                                                        <InputError message={allErrors.mobile_number} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="gender" className="flex items-center gap-2">
                                                            <Users className="size-3.5 text-muted-foreground" />
                                                            Gender
                                                        </Label>
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

                                                    {mustVerifyEmail && user.email_verified_at === null && (
                                                        <div className="sm:col-span-2">
                                                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-400">
                                                                <p>
                                                                    Your email address is unverified.{' '}
                                                                    <Link
                                                                        href="/email/verification-notification"
                                                                        as="button"
                                                                        method="post"
                                                                        className="font-medium underline underline-offset-2 hover:no-underline"
                                                                    >
                                                                        Resend verification email
                                                                    </Link>
                                                                </p>
                                                                {status === 'verification-link-sent' && (
                                                                    <p className="mt-1 text-green-700 dark:text-green-400">
                                                                        A new verification link has been sent.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button disabled={processing} className="w-full sm:w-auto">
                                                    {processing ? 'Saving…' : 'Save changes'}
                                                </Button>
                                            </>
                                        );
                                    }}
                                </Form>
                            </CardContent>
                        </Card>

                        {/* Update Password card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="size-4 text-muted-foreground" />
                                    Update password
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form
                                    method="put"
                                    action="/user/password"
                                    options={{ preserveScroll: true }}
                                    resetOnError={['password', 'password_confirmation', 'current_password']}
                                    resetOnSuccess
                                    className="space-y-5"
                                    onError={(errors) => {
                                        const msg = errors.current_password ?? 'Password update failed.';
                                        toast.error(msg);
                                    }}
                                >
                                    {({ processing, errors }) => (
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="current_password">Current password</Label>
                                                <PasswordInput
                                                    id="current_password"
                                                    name="current_password"
                                                    autoComplete="current-password"
                                                    placeholder="Current password"
                                                />
                                                <InputError message={errors.current_password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password">New password</Label>
                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    autoComplete="new-password"
                                                    placeholder="New password"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                                <PasswordInput
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    autoComplete="new-password"
                                                    placeholder="Confirm password"
                                                />
                                                <InputError message={errors.password_confirmation} />
                                            </div>

                                            <div className="flex items-end">
                                                <Button disabled={processing}>
                                                    {processing ? 'Saving…' : 'Update password'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        {/* Staff Information card */}
                        {user.staff && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="size-4 text-muted-foreground" />
                                        Staff Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form
                                        method="put"
                                        action="/settings/profile/staff"
                                        options={{ preserveScroll: true }}
                                        className="space-y-5"
                                        onError={(errors) => {
                                            const msg = errors.work_email ?? errors.region_id ?? errors.designation ?? 'Staff information update failed.';
                                            toast.error(msg);
                                        }}
                                    >
                                        {({ processing, errors }) => (
                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <div className="grid gap-2 sm:col-span-2">
                                                    <Label htmlFor="work_email" className="flex items-center gap-2">
                                                        <Mail className="size-3.5 text-muted-foreground" />
                                                        Work email
                                                    </Label>
                                                    <Input
                                                        id="work_email"
                                                        type="email"
                                                        defaultValue={user.work_email ?? ''}
                                                        name="work_email"
                                                        autoComplete="email"
                                                        placeholder="Work email"
                                                    />
                                                    <InputError message={errors.work_email} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="region_id">Region</Label>
                                                    <input type="hidden" name="region_id" value={staffRegionId} />
                                                    <Select
                                                        value={staffRegionId}
                                                        onValueChange={(v) => {
                                                            setStaffRegionId(v);
                                                            setStaffDirectorateId('');
                                                            setStaffDepartmentId('');
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
                                                    <Label htmlFor="directorate_id">Directorate</Label>
                                                    <input type="hidden" name="directorate_id" value={staffDirectorateId} />
                                                    <Select
                                                        value={staffDirectorateId}
                                                        onValueChange={(v) => {
                                                            setStaffDirectorateId(v);
                                                            setStaffDepartmentId('');
                                                        }}
                                                        disabled={directorates.length === 0}
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
                                                    <Label htmlFor="department_id">Department</Label>
                                                    <input type="hidden" name="department_id" value={staffDepartmentId} />
                                                    <Select
                                                        value={staffDepartmentId}
                                                        onValueChange={setStaffDepartmentId}
                                                        disabled={departments.length === 0}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select department" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {departments.map((dept) => (
                                                                <SelectItem key={dept.id} value={String(dept.id)}>
                                                                    {dept.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.department_id} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="contract_type_id">Contract type</Label>
                                                    <Select
                                                        name="contract_type_id"
                                                        defaultValue={String(user.staff.contract_type_id ?? '')}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select contract type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {contractTypes.map((ct) => (
                                                                <SelectItem key={ct.id} value={String(ct.id)}>
                                                                    {ct.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.contract_type_id} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="designation">Designation</Label>
                                                    <Input
                                                        id="designation"
                                                        defaultValue={user.staff.designation ?? ''}
                                                        name="designation"
                                                        placeholder="Designation / Job title"
                                                    />
                                                    <InputError message={errors.designation} />
                                                </div>

                                                <div className="sm:col-span-2">
                                                    <Button disabled={processing} className="w-full sm:w-auto">
                                                        {processing ? 'Saving…' : 'Save staff info'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ────── Security Tab ────── */}
                <TabsContent value="security" className="space-y-6">
                    <DeleteUser />
                </TabsContent>

                {/* ────── Appearance Tab ────── */}
                <TabsContent value="appearance" className="space-y-6">
                    <AppearanceTabs />
                </TabsContent>
            </Tabs>
        </div>
    );
}

/*
function SecurityTabContent({
    canManageTwoFactor,
    requiresConfirmation,
    twoFactorEnabled,
}: {
    canManageTwoFactor: boolean;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
}) {
    const [enabling, setEnabling] = useState(false);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }
        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    const handleEnable = async () => {
        setEnabling(true);
        try {
            await fetchSetupData();
            setShowSetupModal(true);
        } finally {
            setEnabling(false);
        }
    };

    return (
        <>
            {canManageTwoFactor && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Two-factor authentication"
                        description="Manage your two-factor authentication settings"
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You will be prompted for a secure, random pin during login.
                            </p>
                            <div className="relative inline">
                                <Form method="post" action="/user/two-factor-authentication">
                                    {({ processing }) => (
                                        <Button variant="destructive" type="submit" disabled={processing}>
                                            Disable 2FA
                                        </Button>
                                    )}
                                </Form>
                            </div>
                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <p className="text-sm text-muted-foreground">
                                When you enable two-factor authentication, you will be prompted for a secure pin during login.
                            </p>
                            <div>
                                {hasSetupData ? (
                                    <Button onClick={() => setShowSetupModal(true)}>
                                        <ShieldCheck />
                                        Continue setup
                                    </Button>
                                ) : (
                                    <Button onClick={handleEnable} disabled={enabling}>
                                        {enabling ? 'Setting up…' : 'Enable 2FA'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            )}
        </>
    );
}
*/

Settings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '/settings/profile' },
    ],
};
