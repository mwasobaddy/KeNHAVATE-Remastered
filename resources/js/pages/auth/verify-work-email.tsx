import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { resend as workEmailResend } from '@/routes/work-email/verify';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function VerifyWorkEmail({ workEmail, status }: { workEmail: string; status?: string }) {
    return (
        <AuthSplitLayout
            title="Verify Work Email"
            description="Please verify your work email address to continue"
        >
            <Head title="Verify work email" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to your work email.
                </div>
            )}

            <Form {...workEmailResend.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <p className="text-sm text-[#9B9EA4] max-w-md mx-auto">
                            We sent a verification link to <strong>{workEmail}</strong>.
                            Please check your inbox and click the link.
                        </p>

                        <Button disabled={processing} variant="secondary" className="bg-[#231F20] text-white hover:bg-[#231F20]/90">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm text-[#9B9EA4] hover:text-[#231F20]"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthSplitLayout>
    );
}

VerifyWorkEmail.layout = {
    title: 'Verify work email',
    description: '',
};
