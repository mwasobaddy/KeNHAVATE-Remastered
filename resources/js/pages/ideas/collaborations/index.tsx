import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Reply } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import RespondToCollaborationDialog from '@/components/respond-to-collaboration-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ideas from '@/routes/ideas';

type Collaborator = { id: number; name: string };

type CollaborationRequest = {
    id: number;
    status: string;
    message: string;
    feedback: string | null;
    created_at: string;
    user: Collaborator;
    reviewer: Collaborator | null;
};

type Props = {
    idea: { slug: string; title: string };
    collaborationRequests: { data: CollaborationRequest[] };
};

const statusStyles: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

export default function CollaborationIndex({ idea, collaborationRequests }: Props) {
    const [respondTarget, setRespondTarget] = useState<(CollaborationRequest & { idea: { slug: string; title: string } }) | null>(null);
    const [activeTips, setActiveTips] = useState<Record<string, boolean>>({});

    const goBack = () => {
        if (window.history.length > 2) {
            window.history.back();
        } else {
            router.visit(ideas.show(idea.slug));
        }
    };

    return (
        <>
            <Head title={`Collaborations - ${idea.title}`} />

            <div className="flex h-full 3xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col items-center gap-1">
                        <Button size="icon" variant="warning" onClick={goBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-[10px] leading-tight text-muted-foreground text-center">Back</span>
                    </div>
                </div>

                <div className="flex items-start justify-between">
                    <Heading
                        title="Collaboration Requests"
                        description={`For: ${idea.title}`}
                    />
                </div>

                {collaborationRequests.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            No collaboration requests yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {collaborationRequests.data.map((cr) => (
                            <Card key={cr.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <CardTitle className="truncate text-base">{cr.user.name}</CardTitle>
                                            <Badge variant="outline" className={(statusStyles[cr.status] ?? '') + ' shrink-0'}>
                                                {cr.status}
                                            </Badge>
                                        </div>
                                        {cr.status === 'pending' && (
                                            <div className="flex items-start gap-2 shrink-0">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Tooltip open={activeTips[`${cr.id}-respond`] ?? false} onOpenChange={(o) => setActiveTips((p) => ({ ...p, [`${cr.id}-respond`]: o }))}>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="success" size="icon" onClick={() => {
 setActiveTips((p) => ({ ...p, [`${cr.id}-respond`]: true })); setRespondTarget({ ...cr, idea: { slug: idea.slug, title: idea.title } }); 
}}>
                                                                <Reply className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Respond</TooltipContent>
                                                    </Tooltip>
                                                    <span className="text-[10px] leading-tight text-muted-foreground text-center">Respond</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {cr.message}
                                    </p>

                                    {cr.feedback && (
                                        <div className="mb-3 rounded-md bg-muted p-3 text-sm">
                                            <span className="font-medium">Feedback: </span>
                                            {cr.feedback}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>{cr.created_at}</span>
                                        {cr.reviewer && (
                                            <span>Reviewed by {cr.reviewer.name}</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <RespondToCollaborationDialog
                    request={respondTarget!}
                    open={respondTarget !== null}
                    onOpenChange={(open) => {
 if (!open) {
setRespondTarget(null);
} 
}}
                />
            </div>
        </>
    );
}

CollaborationIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ideas', href: '/ideas' },
        { title: 'Collaborations', href: '#' },
    ],
};
