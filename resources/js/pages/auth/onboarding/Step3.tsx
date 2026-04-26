import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { step2 } from '@/routes/onboarding';
import { update } from '@/routes/onboarding/step3';

interface Department {
    id: number;
    name: string;
    directorate: {
        name: string;
        region: {
            name: string;
        };
    };
}

interface Step3Props {
    departments: Department[];
    user: {
        work_email: string | null;
        department_id: number | null;
        employment_type: string | null;
    };
}

export default function OnboardingStep3({ departments, user }: Step3Props) {
    return (
        <AuthSplitLayout
            title="Step 3 of 3 - Staff Details"
            description="Please provide your employment information"
        >
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Staff Details</CardTitle>
                    <CardDescription>Step 3 of 3 - Employment Information</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        {...update.form()}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="work_email" className="text-[#231F20]">Work Email *</Label>
                                    <Input 
                                        id="work_email" 
                                        name="work_email" 
                                        type="email" 
                                        placeholder="john.doe@kenha.co.ke"
                                        defaultValue={user.work_email ?? ''}
                                        className="border-[#9B9EA4]/30 focus:border-[#231F20]"
                                    />
                                    <InputError message={errors.work_email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department_id" className="text-[#231F20]">Department *</Label>
                                    <Select name="department_id" defaultValue={user.department_id?.toString() ?? ''}>
                                        <SelectTrigger className="border-[#9B9EA4]/30 focus:border-[#231F20]">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.department_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="employment_type" className="text-[#231F20]">Employment Type *</Label>
                                    <Select name="employment_type" defaultValue={user.employment_type ?? 'permanent'}>
                                        <SelectTrigger className="border-[#9B9EA4]/30 focus:border-[#231F20]">
                                            <SelectValue placeholder="Select employment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="attachment">Attachment</SelectItem>
                                            <SelectItem value="internship">Internship</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="permanent">Permanent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.employment_type} />
                                </div>

                                <div className="flex gap-3">
                                    <Link href={step2.url()} className="flex-1">
                                        <Button type="button" variant="outline" className="w-full border-[#9B9EA4]/30 hover:bg-[#F8EBD5]">
                                            Back
                                        </Button>
                                    </Link>
                                    <Button type="submit" className="flex-1 bg-[#231F20] hover:bg-[#231F20]/90" disabled={processing}>
                                        {processing ? 'Saving...' : 'Complete Setup'}
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

OnboardingStep3.layout = (page: any) => page;
