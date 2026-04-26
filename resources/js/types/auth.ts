export type User = {
    id: number;
    first_name: string;
    other_names: string | null;
    mobile_number: string | null;
    email: string;
    work_email: string | null;
    work_email_verified_at: string | null;
    personal_email: string | null;
    staff_email: string | null;
    department: string | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

// Helper type for backward compatibility
export type UserWithFullName = User & {
    name: string;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
