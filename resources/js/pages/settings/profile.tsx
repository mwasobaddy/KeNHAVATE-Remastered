import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const user = auth.user as {
        name: string;
        email: string;
        mobile_number: string | null;
        gender: string | null;
        staff: {
            region: string | null;
            directorate: string | null;
            department: string | null;
            contract_type: string | null;
            designation: string | null;
        } | null;
    };
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

    const validate = (form: HTMLFormElement): boolean => {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};

        const name = (fd.get('name') as string)?.trim();
        if (!name) errs.name = 'Name is required.';

        const email = (fd.get('email') as string)?.trim();
        if (!email) errs.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile information"
                    description="Update your name and email address"
                />

                <Form
                    method="patch"
                    action="/user/profile-information"
                    ref={formRef}
                    options={{
                        preserveScroll: true,
                    }}
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
                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={user.email}
                                    name="email"
                                    autoComplete="username"
                                    placeholder="Email address"
                                />
                                <InputError message={allErrors.email} />
                            </div>

                            {mustVerifyEmail &&
                                (auth.user as { email_verified_at?: string | null }).email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href="/email/verification-notification"
                                                as="button"
                                                method="post"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>
                                    Save
                                </Button>
                            </div>
                        </>
                    );
                    }}
                </Form>
            </div>

            {/* Mobile & Gender */}
            {(user.mobile_number || user.gender) && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Additional Details"
                        description="Your registered contact and demographic information"
                    />

                    <Card>
                        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                            {user.mobile_number && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                                    <p className="mt-1 text-sm font-medium">{user.mobile_number}</p>
                                </div>
                            )}
                            {user.gender && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Gender</Label>
                                    <p className="mt-1 text-sm font-medium">{user.gender}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Staff Details */}
            {user.staff && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Staff Information"
                        description="Your employment details at KeNHA"
                    />

                    <Card>
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

            {/* Password */}
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                />

                <Form
                    method="put"
                    action="/user/password"
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={['password', 'password_confirmation', 'current_password']}
                    resetOnSuccess
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2 sm:max-w-sm">
                                <Label htmlFor="current_password">Current password</Label>
                                <PasswordInput
                                    id="current_password"
                                    name="current_password"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2 sm:max-w-sm">
                                <Label htmlFor="password">New password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2 sm:max-w-sm">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save password</Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: '/settings/profile',
        },
    ],
};
