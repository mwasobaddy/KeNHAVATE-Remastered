import { Head } from '@inertiajs/react';

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
        name: string;
    };
    likes_count: number;
    user_has_liked: boolean;
    replies: Comment[];
    created_at: string;
}

interface CommentsShowProps {
    idea: Idea;
    comments: Comment[];
}

export default function CommentsShow({ idea, comments }: CommentsShowProps) {
    return (
        <>
            <Head title={`Comments - ${idea.idea_title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Comments</h1>
                                <p className="mt-2 text-muted-foreground">
                                    <Link href={idea.show(idea.slug).url} className="text-primary hover:underline">
                                        ← Back to {idea.idea_title}
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="rounded-lg border p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{comment.user.name}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm">{comment.content}</p>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-6 mt-4 space-y-2">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="rounded border p-3">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium">{reply.user.name}</p>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(reply.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-sm">{reply.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
