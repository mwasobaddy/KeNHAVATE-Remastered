import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import regions from '@/routes/regions';

type Props = {
    region: {
        id: number;
        name: string;
        code: string;
        description: string | null;
        is_active: boolean;
    };
};

export default function RegionEdit({ region }: Props) {
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [tipBack, setTipBack] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit('/dashboard');
        }
    };

    function validate(form: HTMLFormElement): boolean {
        const fd = new FormData(form);
        const errs: Record<string, string> = {};
        if (!(fd.get('name') as string)?.trim()) errs.name = 'Name is required.';
        if (!(fd.get('code') as string)?.trim()) errs.code = 'Code is required.';
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    }

    return (
        <>
            <Head title="Edit Region" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <Tooltip open={tipBack} onOpenChange={setTipBack}>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="warning" onClick={() => { setTipBack(true); goBack(); }}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Back</TooltipContent>
                        </Tooltip>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                    <Heading
                        title="Edit Region"
                        description={`Update "${region.name}"`}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Region Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="put"
                            action={`/regions/${region.id}`}
                            className="space-y-6"
                            ref={formRef}
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
                                                name="name"
                                                defaultValue={region.name}
                                            />
                                            <InputError message={allErrors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="code">Code</Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                defaultValue={region.code}
                                            />
                                            <InputError message={allErrors.code} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                defaultValue={region.description ?? ''}
                                            />
                                            <InputError message={allErrors.description} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                id="is_active"
                                                name="is_active"
                                                type="checkbox"
                                                value="1"
                                                defaultChecked={region.is_active}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="is_active">Active</Label>
                                        </div>
                                        <InputError message={allErrors.is_active} />

                                        <div className="flex items-center gap-4">
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href={regions.index()}>Cancel</Link>
                                            </Button>
                                        </div>
                                    </>
                                );
                            }}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
