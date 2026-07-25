import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Award,
    CheckCircle,
    ClipboardCheck,
    Clock,
    Eye,
    FileText,
    Gavel,
    LayoutDashboard,
    Lightbulb,
    List,
    Plus,
    ShieldCheck,
    Trophy,
    UserCog,
    UserPlus,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import auditRoutes from '@/routes/audit';
import { leaderboard } from '@/routes';
import ideas from '@/routes/ideas';
import points from '@/routes/points';
import roles from '@/routes/roles';
import users from '@/routes/users';

type Transaction = {
    id: number;
    point: { id: number; name: string } | null;
    points: number;
    created_at: string;
    user?: { id: number; name: string };
};

type SystemStats = {
    total_points_awarded: number;
    total_transactions: number;
    users_with_points: number;
    active_actions: number;
};

type ReviewStats = {
    pending_assignment_count?: number;
    my_queue_count?: number;
    pending_decisions_count?: number;
    reviewed_count: number;
};

type StatusBreakdownItem = {
    status: string;
    count: number;
};

type AssignStats = {
    total_submissions: number;
    total_assigned: number;
    your_assignments: number;
    status_breakdown: StatusBreakdownItem[];
};

type UserIdeaStats = {
    total: number;
    drafts: number;
    under_review: number;
    approved: number;
};

type PendingInvitation = {
    id: number;
    idea: { id: number; title: string; slug: string };
    invited_by: number;
    invitedBy: { id: number; name: string };
    created_at: string;
    role: string;
    status: string;
};

type Props = {
    pointsBalance: number;
    recentTransactions: Transaction[];
    userIdeaStats: UserIdeaStats;
    pendingInvitations: PendingInvitation[];
    systemStats?: SystemStats;
    canManagePoints?: boolean;
    canManageUsers?: boolean;
    canManageRoles?: boolean;
    canViewAudit?: boolean;
    canViewReview?: boolean;
    canViewAdmin?: boolean;
    reviewStats?: ReviewStats;
    assignStats?: AssignStats;
    allTransactions?: Transaction[];
    activeTab?: string;
};

export default function Dashboard({
    pointsBalance,
    recentTransactions,
    userIdeaStats,
    pendingInvitations,
    systemStats,
    canManagePoints,
    canManageUsers,
    canManageRoles,
    canViewAudit,
    canViewReview,
    canViewAdmin,
    reviewStats,
    assignStats,
    allTransactions,
    activeTab = 'personal',
}: Props) {
    const tabs = [{ id: 'personal', label: 'Personal', icon: LayoutDashboard }] as const;

    const allTabs: { id: string; label: string; icon: typeof LayoutDashboard }[] = [
        { id: 'personal', label: 'Personal', icon: LayoutDashboard },
    ];

    if (canViewReview) {
        allTabs.push({ id: 'review', label: 'Review', icon: Eye });
    }

    if (canViewAdmin) {
        allTabs.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
    }

    const isAdmin = !!canViewAdmin;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full 2xl:m-auto flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Dashboard"
                        description="Welcome to the KeNHA Innovation Portal"
                    />
                    <div className="flex items-start gap-3">
                        <ActionIcon href={ideas.create().url} icon={Plus} label="New Idea" />
                        <ActionIcon href={ideas.index().url} icon={List} label="Browse Ideas" />
                        <ActionIcon href={leaderboard().url} icon={Trophy} label="Leaderboard" />
                        {canManagePoints && (
                            <ActionIcon href={points.index().url} icon={Award} label="Manage Points" />
                        )}
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => router.visit(`/dashboard?tab=${v}`, { preserveState: true, only: ['activeTab'] })}>
                    <TabsList>
                        {allTabs.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id}>
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="personal">
                        <PersonalTab
                            pointsBalance={pointsBalance}
                            userIdeaStats={userIdeaStats}
                            recentTransactions={recentTransactions}
                            pendingInvitations={pendingInvitations}
                            allTransactions={allTransactions}
                            isAdmin={isAdmin}
                        />
                    </TabsContent>

                    {canViewReview && reviewStats && (
                        <TabsContent value="review">
                            <ReviewTab reviewStats={reviewStats} assignStats={assignStats} />
                        </TabsContent>
                    )}

                    {canViewAdmin && systemStats && (
                        <TabsContent value="admin">
                            <AdminTab
                                systemStats={systemStats}
                                canManagePoints={canManagePoints}
                                canManageUsers={canManageUsers}
                                canManageRoles={canManageRoles}
                                canViewAudit={canViewAudit}
                            />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </>
    );
}

function ActionIcon({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: typeof Plus;
    label: string;
}) {
    return (
        <div className="flex flex-col items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size="icon" asChild>
                        <Link href={href}>
                            <Icon className="h-4 w-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
            </Tooltip>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
                {label}
            </span>
        </div>
    );
}

function PersonalTab({
    pointsBalance,
    userIdeaStats,
    recentTransactions,
    pendingInvitations,
    allTransactions,
    isAdmin,
}: {
    pointsBalance: number;
    userIdeaStats: UserIdeaStats;
    recentTransactions: Transaction[];
    pendingInvitations: PendingInvitation[];
    allTransactions?: Transaction[];
    isAdmin?: boolean;
}) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Your Points"
                    value={pointsBalance.toLocaleString()}
                    subtitle="Total points earned"
                    icon={Award}
                    iconClass="text-amber-600 dark:text-amber-400 bg-amber-500/10"
                />
                <StatCard
                    title="Your Ideas"
                    value={userIdeaStats.total}
                    subtitle={
                        userIdeaStats.drafts > 0
                            ? `${userIdeaStats.drafts} in draft`
                            : 'Ideas submitted'
                    }
                    icon={Lightbulb}
                    iconClass="text-sky-600 dark:text-sky-400 bg-sky-500/10"
                />
                <StatCard
                    title="Under Review"
                    value={userIdeaStats.under_review}
                    subtitle="Awaiting decision"
                    icon={ClipboardCheck}
                    iconClass="text-violet-600 dark:text-violet-400 bg-violet-500/10"
                />
                <StatCard
                    title="Approved"
                    value={userIdeaStats.approved}
                    subtitle="Ideas approved"
                    icon={CheckCircle}
                    iconClass="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className={cn('lg:col-span-2', isAdmin && 'lg:col-span-3')}>
                    <CardHeader>
                        <CardTitle>
                            {isAdmin ? 'All Transactions' : 'Recent Transactions'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(isAdmin && 'max-h-80 overflow-y-auto')}>
                            <table className="w-full text-sm">
                                <thead className={cn(isAdmin && 'sticky top-0 bg-card')}>
                                    <tr className="border-b text-left text-muted-foreground">
                                        {isAdmin && <th className="pb-2 pr-4 font-medium">User</th>}
                                        <th className="pb-2 pr-4 font-medium">Action</th>
                                        <th className="pb-2 pr-4 font-medium text-right">Points</th>
                                        <th className="pb-2 font-medium text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(isAdmin ? allTransactions! : recentTransactions).length > 0 ? (
                                        (isAdmin ? allTransactions! : recentTransactions).map((tx) => (
                                            <tr key={tx.id} className="border-b last:border-0">
                                                {isAdmin && (
                                                    <td className="py-2 pr-4 font-medium">
                                                        {tx.user?.name ?? 'Unknown'}
                                                    </td>
                                                )}
                                                <td className="py-2 pr-4 text-muted-foreground">
                                                    {tx.point?.name ?? 'Deleted Action'}
                                                </td>
                                                <td className="py-2 pr-4 text-right">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                                    >
                                                        +{tx.points}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 text-right text-xs text-muted-foreground">
                                                    {formatDate(tx.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 4 : 3} className="py-8 text-center text-muted-foreground">
                                                {isAdmin ? 'No transactions yet.' : 'Complete onboarding to earn your first points!'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Pending Invitations</CardTitle>
                        {pendingInvitations.length > 0 && (
                            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                                {pendingInvitations.length}
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        {pendingInvitations.length > 0 ? (
                            <div className="space-y-4">
                                {pendingInvitations.map((invitation) => (
                                    <div key={invitation.id} className="flex items-start gap-3 rounded-lg border p-3">
                                        <div className="rounded-full bg-amber-500/10 p-1.5">
                                            <UserPlus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                <Link href={ideas.show(invitation.idea.slug)} className="hover:underline">
                                                    {invitation.idea.title}
                                                </Link>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Invited by {invitation.invitedBy.name}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDate(invitation.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <UserPlus className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">No pending invitations</p>
                                <p className="text-xs text-muted-foreground/70">
                                    You'll see collaboration invites here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ReviewTab({ reviewStats, assignStats }: { reviewStats: ReviewStats; assignStats?: AssignStats }) {
    const statusLabels: Record<string, string> = {
        submitted: 'Submitted',
        assigned: 'Assigned',
        revision_requested: 'Revision Requested',
        resubmitted: 'Resubmitted',
        classified: 'Classified',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    const statusIcons: Record<string, typeof FileText> = {
        submitted: FileText,
        assigned: ClipboardCheck,
        revision_requested: Clock,
        resubmitted: Lightbulb,
        classified: Gavel,
        approved: CheckCircle,
        rejected: Activity,
    };

    const statusColors: Record<string, string> = {
        submitted: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
        assigned: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
        revision_requested: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
        resubmitted: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
        classified: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
        approved: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
        rejected: 'text-red-600 dark:text-red-400 bg-red-500/10',
    };

    return (
        <div className="space-y-6">
            {/* Core Review Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {reviewStats.pending_assignment_count !== undefined && (
                    <StatCard
                        title="Pending Assignment"
                        value={reviewStats.pending_assignment_count}
                        subtitle="Ideas awaiting officer assignment"
                        icon={FileText}
                        iconClass="text-orange-600 dark:text-orange-400 bg-orange-500/10"
                    />
                )}
                {reviewStats.my_queue_count !== undefined && (
                    <StatCard
                        title="My Queue"
                        value={reviewStats.my_queue_count}
                        subtitle="Ideas assigned to you"
                        icon={ClipboardCheck}
                        iconClass="text-violet-600 dark:text-violet-400 bg-violet-500/10"
                    />
                )}
                {reviewStats.pending_decisions_count !== undefined && (
                    <StatCard
                        title="Pending Decisions"
                        value={reviewStats.pending_decisions_count}
                        subtitle="Awaiting DG decision recording"
                        icon={Gavel}
                        iconClass="text-amber-600 dark:text-amber-400 bg-amber-500/10"
                    />
                )}
                <StatCard
                    title="Reviewed"
                    value={reviewStats.reviewed_count}
                    subtitle="Total ideas you've reviewed"
                    icon={Activity}
                    iconClass="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                />
            </div>

            {/* Assign Officer Stats */}
            {assignStats && (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Total Submissions"
                            value={assignStats.total_submissions}
                            subtitle="All submitted ideas"
                            icon={FileText}
                            iconClass="text-blue-600 dark:text-blue-400 bg-blue-500/10"
                            dashed
                        />
                        <StatCard
                            title="Total Assigned"
                            value={assignStats.total_assigned}
                            subtitle="Ideas assigned to an officer"
                            icon={ClipboardCheck}
                            iconClass="text-violet-600 dark:text-violet-400 bg-violet-500/10"
                            dashed
                        />
                        <StatCard
                            title="Your Assignments"
                            value={assignStats.your_assignments}
                            subtitle="Officers you've assigned"
                            icon={UserPlus}
                            iconClass="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            dashed
                        />
                    </div>

                    {/* Status Breakdown */}
                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle>Ideas by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {assignStats.status_breakdown.map((item) => {
                                    const Icon = statusIcons[item.status] || FileText;
                                    const color = statusColors[item.status] || 'text-muted-foreground bg-muted';
                                    const label = statusLabels[item.status] || item.status;

                                    return (
                                        <div
                                            key={item.status}
                                            className="flex items-center gap-3 rounded-lg border p-3"
                                        >
                                            <div className={`rounded-full p-2 ${color}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold">{item.count}</div>
                                                <div className="text-xs text-muted-foreground capitalize">
                                                    {label}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href={ideas.review()}>
                                <Eye className="mr-2 h-4 w-4" />
                                Review Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={ideas.index({ query: { tab: 'my-ideas' } })}>
                                <Lightbulb className="mr-2 h-4 w-4" />
                                Browse Ideas
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function AdminTab({
    systemStats,
    canManagePoints,
    canManageUsers,
    canManageRoles,
    canViewAudit,
}: {
    systemStats: SystemStats;
    canManagePoints?: boolean;
    canManageUsers?: boolean;
    canManageRoles?: boolean;
    canViewAudit?: boolean;
}) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Awarded"
                    value={systemStats.total_points_awarded.toLocaleString()}
                    subtitle="Points across all users"
                    icon={Award}
                    iconClass="text-amber-600 dark:text-amber-400 bg-amber-500/10"
                    dashed
                />
                <StatCard
                    title="Active Actions"
                    value={systemStats.active_actions}
                    subtitle="Point-awarding actions"
                    icon={Lightbulb}
                    iconClass="text-sky-600 dark:text-sky-400 bg-sky-500/10"
                    dashed
                />
                <StatCard
                    title="Active Participants"
                    value={systemStats.users_with_points}
                    subtitle="Users with points"
                    icon={Users}
                    iconClass="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    dashed
                />
                <StatCard
                    title="Transactions"
                    value={systemStats.total_transactions.toLocaleString()}
                    subtitle="Total transactions"
                    icon={Activity}
                    iconClass="text-violet-600 dark:text-violet-400 bg-violet-500/10"
                    dashed
                />
            </div>

            {(canManagePoints || canManageUsers || canManageRoles || canViewAudit) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {canManagePoints && (
                                <Button variant="outline" asChild>
                                    <Link href={points.index()}>
                                        <Award className="mr-2 h-4 w-4" />
                                        Points
                                    </Link>
                                </Button>
                            )}
                            {canManageUsers && (
                                <Button variant="outline" asChild>
                                    <Link href={users.index()}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Users
                                    </Link>
                                </Button>
                            )}
                            {canManageRoles && (
                                <Button variant="outline" asChild>
                                    <Link href={roles.index()}>
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Roles
                                    </Link>
                                </Button>
                            )}
                            {canViewAudit && (
                                <Button variant="outline" asChild>
                                    <Link href={auditRoutes.index()}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Audit Log
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass,
    dashed,
}: {
    title: string;
    value: number | string;
    subtitle: string;
    icon: typeof Award;
    iconClass: string;
    dashed?: boolean;
}) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden',
                dashed ? 'border-dashed' : '',
            )}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,transparent_70%)]" />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`rounded-full p-2 ${iconClass}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative">
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }

    if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)}w ago`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
