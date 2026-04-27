import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useState } from 'react';

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

export default function NotificationsIndex({ notifications }: NotificationsIndexProps) {
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    const markAsRead = (id: string) => {
        setProcessingIds(prev => [...prev, id]);
        router.post(`/notifications/${id}/read`, {}, {
            preserveState: true,
            onFinish: () => {
                setProcessingIds(prev => prev.filter(item => item !== id));
            },
        });
    };

    const markAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Notifications</h1>
                                <p className="mt-2 text-muted-foreground">Stay updated with your ideas</p>
                            </div>
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-primary hover:underline"
                            >
                                Mark all as read
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            {notifications.data.length === 0 ? (
                                <p className="text-muted-foreground">No notifications yet.</p>
                            ) : (
                                notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`rounded-lg border p-4 ${
                                            notification.read_at ? 'bg-background' : 'bg-muted/50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm">{notification.data.message}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notification.read_at && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    disabled={processingIds.includes(notification.id)}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
