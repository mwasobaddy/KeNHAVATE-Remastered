import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export function useCurrentUrl() {
    const { url } = usePage();

    const isCurrentUrl = useCallback(
        (href: string) => {
            const urlPath = new URL(href, window.location.origin).pathname;
            return url === urlPath;
        },
        [url],
    );

    const isCurrentOrParentUrl = useCallback(
        (href: string) => {
            const urlPath = new URL(href, window.location.origin).pathname;
            return url === urlPath || url.startsWith(urlPath + '/');
        },
        [url],
    );

    const whenCurrentUrl = useCallback(
        (href: string) => {
            return isCurrentUrl(href) ? 'page' : undefined;
        },
        [isCurrentUrl],
    );

    return useMemo(
        () => ({ isCurrentUrl, isCurrentOrParentUrl, whenCurrentUrl }),
        [isCurrentUrl, isCurrentOrParentUrl, whenCurrentUrl],
    );
}
