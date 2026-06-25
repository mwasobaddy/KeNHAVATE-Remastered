import { usePage } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type User = {
    name: string;
    email: string;
    avatar?: string;
};

export function UserInfo({ user }: { user?: User }) {
    const { auth } = usePage().props as { auth: { user: User } };
    const currentUser = user || auth.user;
    const getInitials = useInitials();

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 font-medium text-neutral-700 text-xs dark:bg-neutral-700 dark:text-neutral-200">
                    {getInitials(currentUser.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentUser.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                    {currentUser.email}
                </span>
            </div>
        </div>
    );
}
