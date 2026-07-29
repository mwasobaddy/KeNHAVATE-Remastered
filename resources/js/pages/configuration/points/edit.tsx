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
import points from '@/routes/points';

type Props = {
    point: {
        id: number;
        name: string;
        description: string | null;
        points: number;
    };
};

export default function PointEdit({ point }: Props) {
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
        const pointsVal = fd.get('points') as string;
        if (!pointsVal) errs.points = 'Points is required.';
        else if (parseInt(pointsVal) < 1) errs.points = 'Points must be at least 1.';
        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    }

    return (
        <>
            <Head title="Edit Point Action" />

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
                        title="Edit Point Action"
                        description={`Update "${point.name}"`}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Point Action Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="put"
                            action={`/points/${point.id}`}
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
                                                defaultValue={point.name}
                                            />
                                            <InputError message={allErrors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                defaultValue={point.description ?? ''}
                                            />
                                            <InputError message={allErrors.description} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="points">
                                                Points to Award
                                            </Label>
                                            <Input
                                                id="points"
                                                name="points"
                                                type="number"
                                                defaultValue={point.points}
                                            />
                                            <InputError message={allErrors.points} />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href={points.index()}>Cancel</Link>
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


