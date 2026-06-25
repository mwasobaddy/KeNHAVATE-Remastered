import { useState } from 'react';

export function useNotificationCount(initialCount: number = 0) {
    const [unreadCount] = useState<number>(initialCount);

    return { unreadCount };
}
