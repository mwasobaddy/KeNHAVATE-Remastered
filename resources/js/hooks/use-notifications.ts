import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export function useNotificationCount(initialCount = 0) {
    const [unreadCount, setUnreadCount] = useState(initialCount);
    const { auth } = usePage().props as any;

    useEffect(() => {
        if (!window.Echo || !auth?.id) {
return;
}

        const channel = window.Echo.channel('user.' + auth.id);

        channel.listen('.CollaborationRequestReceived', () => {
            setUnreadCount((prev) => prev + 1);
        });

        channel.listen('.CollaborationRequestApproved', () => {
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            channel.stopListening('.CollaborationRequestReceived');
            channel.stopListening('.CollaborationRequestApproved');
            channel.unsubscribe();
        };
    }, [auth?.id]);

    return { unreadCount, setUnreadCount };
}