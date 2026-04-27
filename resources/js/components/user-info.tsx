import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    
    const fullName = user.other_names 
        ? `${user.first_name} ${user.other_names}`
        : user.first_name;

    const avatarUrl = user.avatar ? `/storage/${user.avatar}` : undefined;

    return (
        <div data-slot="user-info" className="flex items-center gap-2">
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(fullName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
}
