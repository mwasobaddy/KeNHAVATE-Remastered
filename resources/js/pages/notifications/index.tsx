'use client';

import { Head, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, FileText, MessageCircle, Heart, Users, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import ideaRoutes from '@/routes/idea';
import comments from '@/routes/idea/comments';

interface Notification {
    id: string;
    type: string;
    data: {
        type: string;
        idea_id: number;
        idea_slug: string;
        idea_title: string;
        user_name: string;
        message: string;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsIndexProps {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
    };
}

const getNotificationIcon = (type: string) => {
    const icons: Record<string, typeof Bell> = {
        'App\\Notifications\\CollaborationRequestReceived': Users,
        'App\\Notifications\\CollaborationApproved': Users,
        'App\\Notifications\\CommentAdded': MessageCircle,
        'App\\Notifications\\IdeaLiked': Heart,
        'App\\Notifications\\IdeaCreated': FileText,
    };

    return icons[type] || Bell;
};

const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
        'App\\Notifications\\CollaborationRequestReceived': 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
        'App\\Notifications\\CollaborationApproved': 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
        'App\\Notifications\\CommentAdded': 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
        'App\\Notifications\\IdeaLiked': 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
        'App\\Notifications\\IdeaCreated': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    };

    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
};

const formatTimeAgo = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(now - then, 0);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    if (hours < 24) {
        return `${hours}h ago`;
    }

    return `${days}d ago`;
};

const goToNotification = (notification: Notification) => {
    const { type, idea_slug } = notification.data;

    if (type === 'comment_added') {
        router.visit(comments.index({ idea: idea_slug }).url);
    } else {
        router.visit(ideaRoutes.show(idea_slug).url);
    }
};

export default function NotificationsIndex({ notifications }: NotificationsIndexProps) {
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    const markAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessingIds((prev) => [...prev, id]);
        router.post(`/notifications/${id}/read`, {}, {
            preserveState: true,
            onFinish: () => {
                setProcessingIds((prev) => prev.filter((item) => item !== id));
            },
        });
    };

    const markAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveState: true,
        });
    };

    const unreadCount = notifications.data.filter((n) => !n.read_at).length;

    return (
        <>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold">Notifications</h1>
                                    {unreadCount > 0 && (
                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-300">
                                            {unreadCount} unread
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-muted-foreground">Stay updated with your ideas</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="mt-6 space-y-3">
                            {notifications.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-muted p-4">
                                        <Bell className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="mt-4 text-muted-foreground">No notifications yet</p>
                                    <p className="text-sm text-muted-foreground">You will see updates about your ideas here</p>
                                </div>
                            ) : (
                                notifications.data.map((notification) => {
                                    const IconComponent = getNotificationIcon(notification.type);
                                    const iconColor = getNotificationColor(notification.type);

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md ${
                                                notification.read_at
                                                    ? 'bg-background border-border'
                                                    : 'border-l-4 border-l-primary bg-muted/30 border-border'
                                            }`}
                                            onClick={() => goToNotification(notification)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`rounded-full p-2 ${iconColor}`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">{notification.data.message}</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {formatTimeAgo(notification.created_at)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => goToNotification(notification)}
                                                                className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                                                                title="View"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </button>
                                                            {!notification.read_at && (
                                                                <button
                                                                    onClick={(e) => markAsRead(notification.id, e)}
                                                                    disabled={processingIds.includes(notification.id)}
                                                                    className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-primary group-hover:opacity-100"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notifications',
            href: '/notifications',
        },
    ],
};