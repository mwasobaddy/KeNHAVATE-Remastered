import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AppearanceTabs from '@/components/appearance-tabs';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';

type StaffDetails = {
    region: string | null;
    directorate: string | null;
    department: string | null;
    contract_type: string | null;
    designation: string | null;
};

type AuthUser = {
    name: string;
    email: string;
    email_verified_at: string | null;
    work_email: string | null;
    mobile_number: string | null;
    gender: string | null;
    staff: StaffDetails | null;
};

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    activeTab?: string;
};

export default function Settings({
    mustVerifyEmail,
    status,
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    activeTab = 'profile',
}: Props) {
    const { auth } = usePage().props;
    const user = auth.user as AuthUser;
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

    const validate = (form: HTMLFormElement): boolean => {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        const name = (fd.get('name') as string)?.trim();
        if (!name) errs.name = 'Name is required.';

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    return (
        <>
            <Head title="Settings" />

            <h1 className="sr-only">Settings</h1>

            <Tabs value={activeTab} onValueChange={(v) => router.visit(`/settings/${v}`)} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                {/* ────── Profile Tab ────── */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left column — Profile information form */}
                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Profile information"
                                description="Update your name, contact details, and other information"
                            />

                            <Form
                                method="put"
                                action="/user/profile-information"
                                ref={formRef}
                                options={{ preserveScroll: true }}
                                className="space-y-6"
                                onSubmit={(e) => {
                                    setClientErrors({});
                                    if (!validate(e.currentTarget)) e.preventDefault();
                                }}
                                onError={(errors) => {
                                    const msg = errors.name ?? errors.mobile_number ?? errors.gender ?? 'Profile update failed.';
                                    toast.error(msg);
                                }}
                            >
                                {({ processing, errors }) => {
                                    const allErrors = { ...clientErrors, ...errors };
                                    return (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    className="mt-1 block w-full"
                                                    defaultValue={user.name}
                                                    name="name"
                                                    autoComplete="name"
                                                    placeholder="Full name"
                                                />
                                                <InputError message={allErrors.name} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email address</Label>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <input type="hidden" name="email" value="" />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="mobile_number">Mobile number</Label>
                                                <Input
                                                    id="mobile_number"
                                                    className="mt-1 block w-full"
                                                    defaultValue={user.mobile_number ?? ''}
                                                    name="mobile_number"
                                                    autoComplete="tel"
                                                    placeholder="Mobile number"
                                                />
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

                                            {user.staff && (
                                                <div className="grid gap-2">
                                                    <Label htmlFor="work_email">Work email</Label>
                                                    <Input
                                                        id="work_email"
                                                        type="email"
                                                        className="mt-1 block w-full"
                                                        defaultValue={user.work_email ?? ''}
                                                        name="work_email"
                                                        autoComplete="email"
                                                        placeholder="Work email"
                                                    />
                                                    <InputError message={allErrors.work_email} />
                                                </div>
                                            )}

                                            {mustVerifyEmail && user.email_verified_at === null && (
                                                <div>
                                                    <p className="-mt-4 text-sm text-muted-foreground">
                                                        Your email address is unverified.{' '}
                                                        <Link
                                                            href="/email/verification-notification"
                                                            as="button"
                                                            method="post"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                        >
                                                            Click here to resend the verification email.
                                                        </Link>
                                                    </p>
                                                    {status === 'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            A new verification link has been sent to your email address.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <Button disabled={processing}>Save</Button>
                                        </>
                                    );
                                }}
                            </Form>
                        </div>

                        {/* Right column — Password, Staff info, Delete account */}
                        <div className="space-y-6">
                            <div className="space-y-6">
                                <Heading
                                    variant="small"
                                    title="Update password"
                                    description="Ensure your account is using a long, random password to stay secure"
                                />

                                <Form
                                    method="put"
                                    action="/user/password"
                                    options={{ preserveScroll: true }}
                                    resetOnError={['password', 'password_confirmation', 'current_password']}
                                    resetOnSuccess
                                    className="space-y-6"
                                    onError={(errors) => {
                                        const msg = errors.current_password ?? 'Password update failed.';
                                        toast.error(msg);
                                    }}
                                >
                                    {({ processing, errors }) => (
                                        <>
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

                                            <Button disabled={processing}>Save password</Button>
                                        </>
                                    )}
                                </Form>
                            </div>

                            {user.staff && (
                                <div>
                                    <Heading
                                        variant="small"
                                        title="Staff Information"
                                        description="Your employment details at KeNHA"
                                    />
                                    <Card className="mt-6">
                                        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                                            {user.staff.region && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Region</Label>
                                                    <p className="mt-1 text-sm font-medium">{user.staff.region}</p>
                                                </div>
                                            )}
                                            {user.staff.directorate && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Directorate</Label>
                                                    <p className="mt-1 text-sm font-medium">{user.staff.directorate}</p>
                                                </div>
                                            )}
                                            {user.staff.department && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Department</Label>
                                                    <p className="mt-1 text-sm font-medium">{user.staff.department}</p>
                                                </div>
                                            )}
                                            {user.staff.contract_type && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Contract Type</Label>
                                                    <p className="mt-1 text-sm font-medium">{user.staff.contract_type}</p>
                                                </div>
                                            )}
                                            {user.staff.designation && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Designation</Label>
                                                    <p className="mt-1 text-sm font-medium">{user.staff.designation}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <DeleteUser />
                        </div>
                    </div>
                </TabsContent>

                {/* ────── Security Tab ────── */}
                <TabsContent value="security" className="space-y-6">
                    <SecurityTabContent
                        canManageTwoFactor={canManageTwoFactor}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                    />
                </TabsContent>

                {/* ────── Appearance Tab ────── */}
                <TabsContent value="appearance" className="space-y-6">
                    <Heading
                        variant="small"
                        title="Appearance settings"
                        description="Update your account's appearance settings"
                    />
                    <AppearanceTabs />
                </TabsContent>
            </Tabs>
        </>
    );
}

function SecurityTabContent({
    canManageTwoFactor,
    requiresConfirmation,
    twoFactorEnabled,
}: {
    canManageTwoFactor: boolean;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

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
                                    <Form method="post" action="/user/two-factor-authentication" onSuccess={() => setShowSetupModal(true)}>
                                        {({ processing }) => (
                                            <Button type="submit" disabled={processing}>
                                                Enable 2FA
                                            </Button>
                                        )}
                                    </Form>
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

Settings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '/settings/profile' },
    ],
};
