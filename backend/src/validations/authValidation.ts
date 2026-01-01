import { body } from "express-validator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const registerValidation = [
    body("name")
        .notEmpty().withMessage("Name is required"),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .custom(async value => {
            const user = await prisma.user.findFirst({
                where: {
                    email: value
                }
            });
            if (user) {
                throw new Error('E-mail already in use');
            }
            return true;
        }),
    body("password")
        .isLength({ min: 5 }).withMessage("Password must be at least 6 characters long"),
];

export const loginValidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
];