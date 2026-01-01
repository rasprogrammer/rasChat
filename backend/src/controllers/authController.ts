import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ValidationError, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";

// Types
import { ErrorMessageType } from "../types/errorMessageType";

import sendResponse from "../utils/Response";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, errors, errors.array()[0].msg);
  }

  const { name, email, password } = req.body;

  // Registration logic here (e.g., save user to database)
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken({
      userId: user.id,
      name: user.name,
      email: user.email
    });

    return sendResponse(res, 201, true,
      { email: user.email, token: token },
      "User registered successfully"
    );
  } catch (error) {
    return sendResponse(res, 500, false, null, "Registration failed");
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, errors, errors.array()[0].msg);
  }
  const { email, password } = req.body;
  // Login logic here (e.g., verify user credentials)
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (user && (await bcrypt.compare(password, user.password))) {

      // sign jwt token and send to user
      const token = generateToken({
        userId: user.id,
        name: user.name,
        email: user.email
      });
      
      return sendResponse(res, 200, true, {
          id: user.id,
          email: user.email,
          name: user.name,
          token
        },
        "Login successful"
      );
    } else {
      return sendResponse(res, 401, false, null, "Invalid credentials");
    }
  } catch (error) {
    return sendResponse(res, 500, false, null, "Login failed");
  }
};

export const logoutUser = (req: Request, res: Response) => {
  const err = true;
  if (err) {
    return sendResponse(res, 500, false, null, "Logout failed");
  }
  return sendResponse(res, 200, true, null, "Logout successful");
  
};