import bcrypt from "bcrypt";
export const hashPassword = (password) => {
    return bcrypt.hash(password, 10);
};
export const verifyPassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
//# sourceMappingURL=bcrypt.js.map