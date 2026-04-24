import { HttpStatus } from "../utils/HttpStatus.js";
import { hashPassword, verifyPassword } from "../utils/bcrypt.js";
import { CreateUserSchema, SigninSchema } from "../validations/authSchema.js";
import { createUser, getUserByEmail, getUserById } from "../models/auth.model.js";
import { generateToken } from "../utils/jwt.js";
export const signup = async (req, res) => {
    try {
        console.log('req body > ', req.body);
        const parsedData = CreateUserSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                error: parsedData.error,
            });
            return;
        }
        const { name, email, password } = parsedData.data;
        // check if user exits already or not 
        const userExist = await getUserByEmail(email);
        if (userExist) {
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                error: "User already exists"
            });
            return;
        }
        // hashed password 
        const hashedPassword = await hashPassword(password);
        // create user
        const newUser = await createUser(email, hashedPassword, name);
        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
    catch (error) {
        console.error("Signup Error:", error);
        res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: "Internal server error" });
        return;
    }
};
export const signin = async (req, res) => {
    try {
        const parsedData = SigninSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                error: parsedData.error
            });
            return;
        }
        const { email, password } = parsedData.data;
        const user = await getUserByEmail(email);
        if (!user) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: "Invalid email or password -> email not exist"
            });
            return;
        }
        // console.log(user);
        // Compare passwords
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: "Invalid email or password"
            });
            return;
        }
        // Generate Token 
        const token = generateToken(user.id);
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Signin successful",
            token
        });
    }
    catch (error) {
        console.log("Signin Error:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: "Interval server error" });
    }
};
export const me = async (req, res) => {
    try {
        if (!req.auth?.id) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: "Unauthorized: No userID found"
            });
        }
        const user = await getUserById(req.auth.id);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                error: "User not found"
            });
        }
        return res.status(HttpStatus.OK).json({
            success: true,
            message: `Welcome ${user.name}`,
            user: {
                id: user.id,
                name: user.name
            }
        });
    }
    catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    }
};
//# sourceMappingURL=auth.controller.js.map