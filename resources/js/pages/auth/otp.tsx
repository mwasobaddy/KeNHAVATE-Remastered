import { Form, Head, router } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

const OTP_LENGTH = 6;

type Props = {
    email: string;
    status?: string;
    cooldown_remaining: number;
};

export default function OtpVerification({ email, status, cooldown_remaining }: Props) {
    const [otp, setOtp] = useState<string>('');
    const [cooldown, setCooldown] = useState<number>(cooldown_remaining);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const interval = setInterval(() => {
            setCooldown(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    const handleResend = () => {
        if (cooldown > 0) {
            return;
        }

        setCooldown(60);
        router.post('/auth/otp/resend');
    };

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;

        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <AuthSplitLayout
            title="Check your email"
            description={`We sent a 6-digit code to ${email}`}
        >
            <Head title="Verify OTP" />

            <Form method="post" action="/auth/otp/verify" className="flex flex-col gap-6">
                {({ processing, errors, clearErrors }) => (
                    <div className="grid gap-6">
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">
                            <div className="flex w-full items-center justify-center">
                                <InputOTP
                                    name="otp"
                                    maxLength={OTP_LENGTH}
                                    value={otp}
                                    onChange={(value) => {
                                        setOtp(value);
                                        clearErrors();
                                    }}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <InputError message={errors.otp} />

                            {status && (
                                <p className="text-sm font-medium text-green-600">
                                    {status}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox id="remember" name="remember" />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full rounded-full bg-yellow text-black hover:bg-yellow/90 shadow-sm"
                            disabled={processing || otp.length !== OTP_LENGTH}
                        >
                            <span className="inline-flex items-center gap-2">
                                {processing ? 'Verifying...' : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Verify
                                    </>
                                )}
                            </span>
                        </Button>

                        <div className="flex flex-col items-center gap-1">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={cooldown > 0}
                                className="cursor-pointer text-sm text-muted-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50 dark:decoration-neutral-500"
                            >
                                {cooldown > 0
                                    ? `Resend code in ${formatTime(cooldown)}`
                                    : "Didn't receive the code? Resend"}
                            </button>
                            <InputError message={errors.email} />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <a
                                href="/login"
                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                            >
                                Use a different email
                            </a>
                        </div>
                    </div>
                )}
            </Form>
        </AuthSplitLayout>
    );
}

OtpVerification.layout = {};
