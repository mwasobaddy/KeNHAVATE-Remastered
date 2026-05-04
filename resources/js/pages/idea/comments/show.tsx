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

interface CommentItemProps {
    comment: Comment;
    depth: number;
    onReply: (user: { email?: string; work_email?: string; name: string } | null, commentId: number) => void;
    onLike: (commentId: number) => void;
    commentLikes: Record<number, number>;
    commentLiked: Record<number, boolean>;
    commentLiking: Record<number, boolean>;
    localReplies: Record<number, Comment[]>;
}

function CommentItem({
    comment,
    depth,
    onReply,
    onLike,
    commentLikes,
    commentLiked,
    commentLiking,
    localReplies,
}: CommentItemProps) {
    const displayName = getDisplayName(comment.user);
    const replies = [...(comment.replies || []), ...(localReplies[comment.id] || [])];
    const canReply = depth < 4;

    return (
        <div className="flex gap-3">
            {comment.user?.avatar ? (
                <img
                    src={comment.user.avatar}
                    alt={`${comment.user?.name ?? [comment.user?.first_name, comment.user?.other_names].filter(Boolean).join(' ') ?? 'Unknown'}'s avatar`}
                    className={`${depth === 0 ? 'h-11 w-11' : 'h-8 w-8'} shrink-0 rounded-full object-cover border-2 border-border`}
                />
            ) : (
                <div className={`flex ${depth === 0 ? 'h-11 w-11' : 'h-8 w-8'} shrink-0 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold uppercase text-slate-700`}>
                    {getAvatarLabel(displayName)}
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className={`${depth === 0 ? 'text-sm leading-6' : 'text-sm leading-5'} text-foreground`}>
                    <span className="font-semibold text-foreground">
                        {displayName}
                    </span>{' '}
                    {comment.content}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatTimeAgo(comment.created_at)}</span>
                    <span>{(commentLikes[comment.id] ?? comment.likes_count) ?? 0} likes</span>
                    {comment.user && canReply && (
                        <button
                            type="button"
                            className="font-medium text-primary hover:underline"
                            onClick={() => onReply(comment.user, comment.id)}
                        >
                            Reply
                        </button>
                    )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onLike(comment.id)}
                        disabled={commentLiking[comment.id]}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition ${(commentLiked[comment.id] ?? comment.user_has_liked) ? 'border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20' : 'border-border text-muted-foreground hover:bg-muted/10'}`}
                    >
                        <Heart className="h-3 w-3" />
                        {(commentLiked[comment.id] ?? comment.user_has_liked) ? 'Liked' : 'Like'}
                    </button>
                </div>

                {replies.length > 0 && depth < 4 && (
                    <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
                        {replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                depth={depth + 1}
                                onReply={onReply}
                                onLike={onLike}
                                commentLikes={commentLikes}
                                commentLiked={commentLiked}
                                commentLiking={commentLiking}
                                localReplies={localReplies}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CommentsShow({ idea, comments }: CommentsShowProps) {
    const [localComments, setLocalComments] = useState<Comment[]>([]);
    const [localReplies, setLocalReplies] = useState<Record<number, Comment[]>>({});

    const allComments = [...comments.data, ...localComments];

    const addReplyToComment = (parentId: number | null, reply: Comment) => {
        if (!parentId) {
            setLocalComments((prev) => [reply, ...prev]);
        } else {
            setLocalReplies((prev) => ({
                ...prev,
                [parentId]: [...(prev[parentId] || []), reply],
            }));
        }
    };

    const form = useForm({
        idea_id: idea.id,
        content: '',
        parent_id: null as number | null,
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

const handleReplyToComment = (user: { email?: string; work_email?: string; name: string } | null, commentId: number) => {
    if (!user) {
        return;
    }

    const prefix = getReplyTag(user);
    form.setData('content', `${prefix} `);
    form.setData('parent_id', commentId);

    if (replyInputRef.current) {
        replyInputRef.current.focus();
    }
};

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.data.content.trim()) {
            return;
        }

        try {
            const response = await axios.post(commentsRoute.store().url, {
                idea_id: form.data.idea_id,
                content: form.data.content,
                parent_id: form.data.parent_id,
            });

            const newComment = response.data.comment;

            if (newComment.parent_id) {
                addReplyToComment(newComment.parent_id, newComment);
            } else {
                setLocalComments((prev) => [newComment, ...prev]);
            }

            form.reset();
            form.setData('parent_id', null);
        } catch {
            // Error handling
        }
    };

    return (
        <>
            <Head title={`Comments - ${idea.idea_title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex flex-col">
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
                                {allComments.map((comment) => (
                                    <div key={comment.id} className="rounded-3xl border border-border bg-background p-4 shadow-sm">
                                        <CommentItem
                                            comment={comment}
                                            depth={0}
                                            onReply={handleReplyToComment}
                                            onLike={handleLikeComment}
                                            commentLikes={commentLikes}
                                            commentLiked={commentLiked}
                                            commentLiking={commentLiking}
                                            localReplies={localReplies}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur"
                    >
                        <div className="flex gap-2">
                            {form.data.parent_id && (
                                <div className="flex items-center pr-2 text-sm text-muted-foreground">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            form.setData('parent_id', null);
                                            form.setData('content', '');
                                        }}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        ✕ Cancel reply
                                    </button>
                                </div>
                            )}
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Smile className="h-5 w-5" />
                                </div>
                                <Input
                                    ref={replyInputRef}
                                    value={form.data.content}
                                    onChange={(event) => form.setData('content', event.target.value)}
                                    placeholder={form.data.parent_id ? 'Write a reply...' : 'Add a comment'}
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
