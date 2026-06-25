export type Auth = {
    user: User;
};

export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    [key: string]: unknown;
};
