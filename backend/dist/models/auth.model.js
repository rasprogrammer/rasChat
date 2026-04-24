import { prisma } from "../lib/prisma.js";
export const getUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email
        }
    });
};
export const createUser = async (email, hashedPassword, name) => {
    return await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });
};
export const getUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
};
//# sourceMappingURL=auth.model.js.map