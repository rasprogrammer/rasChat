export declare const getUserByEmail: (email: string) => Promise<{
    email: string;
    password: string;
    name: string;
    id: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const createUser: (email: string, hashedPassword: string, name: string) => Promise<{
    email: string;
    password: string;
    name: string;
    id: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getUserById: (userId: string) => Promise<{
    email: string;
    password: string;
    name: string;
    id: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
//# sourceMappingURL=auth.model.d.ts.map