import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role && role !== "CLIENT") {
      return errorResponse(
        res,
        "Registration is only allowed for CLIENT role.",
        403
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "Email already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT", // Force CLIENT role
      },
    });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = newUser;

    // Issue JWT like in login for immediate session after registration
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return successResponse(
      res,
      { token, user: userWithoutPassword },
      "User registered successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, "Registration failed", 500, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return successResponse(res, { token }, "Login successful");
  } catch (error) {
    return errorResponse(res, "Login failed", 500, error);
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["ADMIN", "WORKER"].includes(role)) {
      return errorResponse(
        res,
        "Invalid role. Only ADMIN or WORKER can be created here.",
        400
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "Email already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return successResponse(
      res,
      userWithoutPassword,
      "User created successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, "User creation failed", 500, error);
  }
};
