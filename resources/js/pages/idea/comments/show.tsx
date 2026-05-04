import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Heart, Smile } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import commentsRoute from '@/routes/comments';
import { show as ideaShowRoute } from '@/routes/idea';

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
}

interface Comment {
    id: number;
    content: string;
    user: {
        id: number;
        name?: string;
        first_name?: string;
        other_names?: string;
        email?: string;
        work_email?: string;
        avatar?: string | null;
    } | null;
    likes_count: number;
    user_has_liked: boolean;
    replies: Comment[];
    created_at: string;
}

interface CommentsShowProps {
    idea: Idea;
    comments: {
        data: Comment[];
        current_page: number;
        last_page: number;
    };
}

// Helper functions
const getReplyTag = (user: { email?: string; work_email?: string; name?: string; first_name?: string; other_names?: string } | null) => {
    if (!user) {
        return '@unknown';
    }

    const email = user.email ?? user.work_email;

    if (email) {
        return `@${email.split('@')[0]}`;
    }

    const name = user.name ?? [user.first_name, user.other_names].filter(Boolean).join(' ').trim();

    if (name) {
        return `@${name.replace(/\s+/g, '_').toLowerCase()}`;
    }

    return '@unknown';
};

const getDisplayName = (user: { email?: string; work_email?: string; name?: string; first_name?: string; other_names?: string } | null) => {
    if (!user) {
        return 'Unknown';
    }

    const email = user.email ?? user.work_email;

    if (email) {
        return `@${email.split('@')[0]}`;
    }

    return user.name ?? ([user.first_name, user.other_names].filter(Boolean).join(' ').trim() || 'Unknown');
};

const getAvatarLabel = (displayName: string) => {
    const label = displayName.replace(/^@/, '');
    return label.charAt(0).toUpperCase();
};

const formatTimeAgo = (date: string) => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = Math.max(now - then, 0);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
        return `${minutes}m`;
    }

    if (hours < 24) {
        return `${hours}h`;
    }

    return `${days}d`;
};

export default function CommentsShow({ idea, comments }: CommentsShowProps) {
    const form = useForm({
        idea_id: idea.id,
        content: '',
    });
    const [commentLikes, setCommentLikes] = useState<Record<number, number>>(() =>
        Object.fromEntries(comments.data.map((comment) => [comment.id, comment.likes_count]))
    );
    const [commentLiked, setCommentLiked] = useState<Record<number, boolean>>(() =>
        Object.fromEntries(comments.data.map((comment) => [comment.id, comment.user_has_liked]))
    );
    const [commentLiking, setCommentLiking] = useState<Record<number, boolean>>({});
    const replyInputRef = useRef<HTMLInputElement | null>(null);

    const handleLikeComment = async (commentId: number) => {
        if (commentLiking[commentId]) {
            return;
        }

        setCommentLiking((prev) => ({ ...prev, [commentId]: true }));

        try {
            const response = await axios.post('/likes', {
                likeable_type: 'comment',
                likeable_id: commentId,
            });

            const { liked, likes_count: likesCount } = response.data;

            setCommentLiked((prev) => ({ ...prev, [commentId]: liked }));
            setCommentLikes((prev) => ({ ...prev, [commentId]: likesCount }));
        } catch {
            // Silence failure for now.
        } finally {
            setCommentLiking((prev) => ({ ...prev, [commentId]: false }));
        }
    };

const handleReplyToComment = (user: { email?: string; work_email?: string; name: string } | null) => {
    if (!user) {
        return;
    }

        const prefix = getReplyTag(user);
        form.setData('content', `${prefix} `);

        if (replyInputRef.current) {
            replyInputRef.current.focus();
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.data.content.trim()) {
            return;
        }

        form.post(commentsRoute.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('content');
            },
        });
    };

    return (
        <>
            <Head title={`Comments - ${idea.idea_title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex h-full flex-col">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">Comments</h1>
                                    <p className="mt-2 text-muted-foreground">
                                        <Link href={ideaShowRoute(idea.slug).url} className="text-primary hover:underline">
                                            ← Back to {idea.idea_title}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-4">
                        {comments.data.length === 0 ? (
                            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                        ) : (
                            <div className="space-y-4">
                                {comments.data.map((comment) => {
                                    const displayName = getDisplayName(comment.user);

                                    return (
                                        <div key={comment.id} className="rounded-3xl border border-border bg-background p-4 shadow-sm">
                                            <div className="flex gap-3">
                                                {comment.user?.avatar ? (
                                                    <img
                                                        src={comment.user.avatar}
                                                        alt={`${comment.user?.name ?? [comment.user?.first_name, comment.user?.other_names].filter(Boolean).join(' ') ?? 'Unknown'}'s avatar`}
                                                        className="h-11 w-11 shrink-0 rounded-full object-cover border-2 border-border"
                                                    />
                                                ) : (
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-300 text-base font-semibold uppercase text-slate-700">
                                                        {getAvatarLabel(displayName)}
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm leading-6 text-foreground">
                                                        <span className="font-semibold text-foreground">
                                                            {displayName}
                                                        </span>{' '}
                                                        {comment.content}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        <span>{formatTimeAgo(comment.created_at)}</span>
                                                        <span>{(commentLikes[comment.id] ?? comment.likes_count) ?? 0} likes</span>
                                                        {comment.user ? (
                                                            <button
                                                                type="button"
                                                                className="font-medium text-primary hover:underline"
                                                                onClick={() => handleReplyToComment(comment.user)}
                                                            >
                                                                Reply
                                                            </button>
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleLikeComment(comment.id)}
                                                            disabled={commentLiking[comment.id]}
                                                            className=`{inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${(commentLiked[comment.id] ?? comment.user_has_liked) ? 'border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20' : 'border-border text-muted-foreground hover:bg-muted/10'}}`
                                                        >
                                                            <Heart className="h-4 w-4" />
                                                            {(commentLiked[comment.id] ?? comment.user_has_liked) ? 'Liked' : 'Like'}
                                                        </button>
                                                    </div>

                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div className="mt-4 border-t border-border pt-4">
                                                            <div className="space-y-3">
                                                                {comment.replies.map((reply) => {
                                                                    const replyDisplayName = getDisplayName(reply.user);
                                                                    return (
                                                                        <div key={reply.id} className="rounded-3xl border border-border bg-muted/5 p-3">
                                                                            <div className="flex gap-3">
                                                                                {reply.user?.avatar ? (
                                                                                    <img
                                                                                        src={reply.user.avatar}
                                                                                        alt={`${reply.user?.name ?? 'Unknown'}'s avatar`}
                                                                                        className="h-9 w-9 shrink-0 rounded-full object-cover border-2 border-border"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold uppercase text-slate-700">
                                                                                        {getAvatarLabel(replyDisplayName)}
                                                                                    </div>
                                                                                )}
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="text-sm leading-5 text-foreground">
                                                                                        <span className="font-semibold text-foreground">
                                                                                            {replyDisplayName}
                                                                                        </span>{' '}
                                                                                        {reply.content}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur"
                    >
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Smile className="h-5 w-5" />
                                </div>
                                <Input
                                    ref={replyInputRef}
                                    value={form.data.content}
                                    onChange={(event) => form.setData('content', event.target.value)}
                                    placeholder="Add a comment"
                                    className="w-full rounded-full border border-border bg-background px-12 py-3"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={form.processing || !form.data.content.trim()}
                                className="rounded-full px-6"
                            >
                                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                Post
                            </Button>
                        </div>
                        {form.errors.content && (
                            <p className="mt-2 text-sm text-destructive">{form.errors.content}</p>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
