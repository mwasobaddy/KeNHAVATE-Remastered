import { Form, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { step2 } from '@/routes/onboarding';
import { update } from '@/routes/onboarding/step3';

interface Region {
    id: number;
    name: string;
    directorates: Directorate[];
}

interface Directorate {
    id: number;
    name: string;
    departments: Department[];
}

interface Department {
    id: number;
    name: string;
}

interface Step3Props {
    regions: Region[];
    user: {
        work_email: string | null;
        email: string | null;
        region_id: number | null;
        directorate_id: number | null;
        department_id: number | null;
        employment_type: string | null;
    };
}

export default function OnboardingStep3({ regions, user }: Step3Props) {
    const { email } = usePage<{ email: string }>().props;
    const isKenhaEmail = email.endsWith('@kenha.co.ke');

    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(user.region_id);
    const [selectedDirectorateId, setSelectedDirectorateId] = useState<number | null>(user.directorate_id);

    // Get directorates for selected region
    const directorates = selectedRegionId
        ? regions.find(r => r.id === selectedRegionId)?.directorates || []
        : [];

    // Get departments for selected directorate
    const departments = selectedDirectorateId
        ? directorates.find(d => d.id === selectedDirectorateId)?.departments || []
        : [];

    const handleRegionChange = (regionId: string) => {
        setSelectedRegionId(Number(regionId));
        setSelectedDirectorateId(null);
    };

    const handleDirectorateChange = (directorateId: string) => {
        setSelectedDirectorateId(Number(directorateId));
    };

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
                                {isKenhaEmail ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[#231F20]">Personal Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="personal@email.com"
                                            defaultValue={user.email ?? ''}
                                            className="border-[#9B9EA4]/30 focus:border-[#231F20]"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                ) : (
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
                                )}

                                <input type="hidden" name="region_id" value={selectedRegionId || ''} />
                                <input type="hidden" name="directorate_id" value={selectedDirectorateId || ''} />

                                <div className="space-y-2">
                                    <Label htmlFor="region_id" className="text-[#231F20]">Region *</Label>
                                    <Select
                                        value={selectedRegionId?.toString() ?? ''}
                                        onValueChange={handleRegionChange}
                                    >
                                        <SelectTrigger className="border-[#9B9EA4]/30 focus:border-[#231F20]">
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {regions.map((region) => (
                                                <SelectItem key={region.id} value={region.id.toString()}>
                                                    {region.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.region_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="directorate_id" className="text-[#231F20]">Directorate *</Label>
                                    <Select
                                        value={selectedDirectorateId?.toString() ?? ''}
                                        onValueChange={handleDirectorateChange}
                                        disabled={!selectedRegionId}
                                    >
                                        <SelectTrigger className="border-[#9B9EA4]/30 focus:border-[#231F20]">
                                            <SelectValue placeholder="Select directorate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {directorates.map((directorate) => (
                                                <SelectItem key={directorate.id} value={directorate.id.toString()}>
                                                    {directorate.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.directorate_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department_id" className="text-[#231F20]">Department *</Label>
                                    <Select
                                        name="department_id"
                                        defaultValue={user.department_id?.toString() ?? ''}
                                        disabled={!selectedDirectorateId}
                                    >
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
