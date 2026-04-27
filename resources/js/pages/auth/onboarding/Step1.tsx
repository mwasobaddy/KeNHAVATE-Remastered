import { Form, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { start } from '@/routes/onboarding';
import { update } from '@/routes/onboarding/step1';

export default function OnboardingStep1() {
    const { email, user } = usePage<{ email: string; user: { first_name: string | null; other_names: string | null; mobile_number: string | null; gender: string | null; avatar: string | null } }>().props;
    const hasStaffEmail = email.endsWith('@kenha.co.ke');
    const totalSteps = hasStaffEmail ? 3 : 2;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
        <AuthSplitLayout
            // title={`Step 1 of \`${totalSteps}\` - Personal Information`}
            // description="Please provide your personal details"
        >
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome! Let's Get Started</CardTitle>
                    <CardDescription>Step 1 of {totalSteps} - Personal Information</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        {...update.form()}
                        className="space-y-4"
                        encType="multipart/form-data"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="flex flex-col items-center gap-4">
                                    <Label className="text-[#231F20]">Profile Photo *</Label>
                                    <div className="relative">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Profile preview"
                                                className="h-24 w-24 rounded-full object-cover border-2 border-border"
                                            />
                                        ) : user.avatar ? (
                                            <img
                                                src={user.avatar.startsWith('http') ? user.avatar : '/storage/' + user.avatar}
                                                alt="Profile"
                                                className="h-24 w-24 rounded-full object-cover border-2 border-border"
                                            />
                                        ) : (
                                            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                                <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                        <Label
                                            htmlFor="avatar"
                                            className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </Label>
                                        <Input
                                            id="avatar"
                                            name="avatar"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];

                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setPreviewUrl(url);
                                                }
                                            }}
                                        />
                                    </div>
                                    <InputError message={errors.avatar} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-[#231F20]">First Name *</Label>
                                    <Input 
                                        id="first_name" 
                                        name="first_name" 
                                        placeholder="John"
                                        defaultValue={user.first_name ?? ''}
                                        className="border-[#9B9EA4]/30 focus:border-[#231F20]"
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="other_names" className="text-[#231F20]">Other Names *</Label>
                                    <Input 
                                        id="other_names" 
                                        name="other_names" 
                                        placeholder="Doe Smith"
                                        defaultValue={user.other_names ?? ''}
                                        className="border-[#9B9EA4]/30 focus:border-[#231F20]"
                                    />
                                    <InputError message={errors.other_names} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile_number" className="text-[#231F20]">Mobile Number *</Label>
                                    <Input 
                                        id="mobile_number" 
                                        name="mobile_number" 
                                        placeholder="+1 234 567 8900"
                                        defaultValue={user.mobile_number ?? ''}
                                        className="border-[#9B9EA4]/30 focus:border-[#231F20]"
                                    />
                                    <InputError message={errors.mobile_number} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-[#231F20]">Gender *</Label>
                                    <Select name="gender" defaultValue={user.gender ?? ''}>
                                        <SelectTrigger className="border-[#9B9EA4]/30 focus:border-[#231F20]">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.gender} />
                                </div>

                                <div className="flex gap-3">
                                    <Link href={start()} className="flex-1">
                                        <Button type="button" variant="outline" className="w-full border-[#9B9EA4]/30 hover:bg-[#F8EBD5]">
                                            Back
                                        </Button>
                                    </Link>
                                    <Button type="submit" className="flex-1 bg-[#231F20] hover:bg-[#231F20]/90" disabled={processing}>
                                        {processing ? 'Saving...' : 'Next'}
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

OnboardingStep1.layout = (page: any) => page;