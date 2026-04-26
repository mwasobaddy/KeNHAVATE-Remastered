import { Form, Link, usePage } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { step1 } from '@/routes/onboarding';
import { update } from '@/routes/onboarding/step2';

export default function OnboardingStep2() {
    const { email, hasPassword } = usePage<{ email: string; hasPassword: boolean }>().props;
    const isKenhaEmail = email.endsWith('@kenha.co.ke');
    const totalSteps = isKenhaEmail ? 3 : 2;

    // @kenha.co.ke emails are always staff; others can opt-in
    const [needsStaffDetails, setNeedsStaffDetails] = useState(isKenhaEmail);
    const [showPasswordFields, setShowPasswordFields] = useState(!hasPassword);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <AuthSplitLayout
            title="Step 2 of {totalSteps} - Security Setup"
            description="Set up your account security"
        >
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Set Up Your Account</CardTitle>
                    <CardDescription>Step 2 of {totalSteps} - Security Setup</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        {...update.form()}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {hasPassword && (
                                    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                        A password is already set for your account. You can{' '}
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                                            className="text-primary hover:underline"
                                        >
                                            {showPasswordFields ? 'keep it as is' : 'change it'}
                                        </button>
                                        .
                                    </div>
                                )}

                                {showPasswordFields && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-[#231F20]">Password *</Label>
                                            <div className="relative">
                                                <Input 
                                                    id="password" 
                                                    name="password" 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder="Enter a secure password"
                                                    minLength={8}
                                                    className="border-[#9B9EA4]/30 focus:border-[#231F20]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#231F20]"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-[#231F20]">Confirm Password *</Label>
                                            <div className="relative">
                                                <Input 
                                                    id="password_confirmation" 
                                                    name="password_confirmation" 
                                                    type={showConfirmPassword ? "text" : "password"} 
                                                    placeholder="Confirm your password"
                                                    className="border-[#9B9EA4]/30 focus:border-[#231F20]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#231F20]"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </>
                                )}

                                {!showPasswordFields && hasPassword && (
                                    <>
                                        <input type="hidden" name="password" value="placeholder" />
                                        <input type="hidden" name="password_confirmation" value="placeholder" />
                                    </>
                                )}

                                {!isKenhaEmail && (
                                    <div className="flex items-start gap-3 pt-2">
                                        <Checkbox
                                            id="needs_staff_details"
                                            name="needs_staff_details"
                                            checked={needsStaffDetails}
                                            onCheckedChange={(checked) => setNeedsStaffDetails(checked === true)}
                                        />
                                        <Label htmlFor="needs_staff_details" className="text-sm leading-tight cursor-pointer text-[#231F20]">
                                            I am a staff member — I need to provide work details
                                        </Label>
                                    </div>
                                )}

                                {/* Hidden input ensures the value is always submitted */}
                                <input type="hidden" name="needs_staff_details" value={needsStaffDetails ? '1' : '0'} />

                                <InputError message={errors.needs_staff_details} />

                                <div className="flex gap-3">
                                    <Link href={step1.url()} className="flex-1">
                                        <Button type="button" variant="outline" className="w-full border-[#9B9EA4]/30 hover:bg-[#F8EBD5]">
                                            Back
                                        </Button>
                                    </Link>
                                    <Button type="submit" className="flex-1 bg-[#231F20] hover:bg-[#231F20]/90" disabled={processing}>
                                        {processing ? 'Saving...' : needsStaffDetails ? 'Next' : 'Finish'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </AuthSplitLayout>
    );
}

OnboardingStep2.layout = (page: any) => page;
