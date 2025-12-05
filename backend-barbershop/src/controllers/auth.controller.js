import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, avatarUrl } = req.body;

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
        phone,
        avatarUrl,
      },
    });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = newUser;

    // Issue JWT like in login for immediate session after registration
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
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
      { id: user.id, email: user.email, role: user.role, name: user.name },
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
    const { name, email, password, role, phone, avatarUrl, bio, specialties } =
      req.body;

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

    // Preparar datos según el rol
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    // ADMIN: phone es opcional, bio y specialties no se usan
    if (role === "ADMIN") {
      if (phone) userData.phone = phone;
      if (avatarUrl) userData.avatarUrl = avatarUrl;
    }

    // WORKER: phone, avatarUrl, bio y specialties son requeridos
    if (role === "WORKER") {
      if (!bio || !specialties) {
        return errorResponse(
          res,
          "WORKER role requires bio and specialties",
          400
        );
      }
      userData.phone = phone;
      userData.avatarUrl = avatarUrl;
      userData.bio = bio;
      userData.specialties = specialties;
    }

    const newUser = await prisma.user.create({
      data: userData,
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

// Iniciar autenticación con Google OAuth
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Callback de Google OAuth
export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err) {
      return errorResponse(res, "Google authentication failed", 500, err);
    }
    if (!user) {
      return errorResponse(res, "Google authentication failed", 401);
    }

    try {
      // Generar JWT para el usuario autenticado
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirigir al frontend con el token
      const frontendUrl =
        process.env.FRONTEND_ORIGIN || "http://localhost:3000";
      res.redirect(
        `${frontendUrl}/auth/success?token=${token}&user=${encodeURIComponent(
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
        )}`
      );
    } catch (error) {
      return errorResponse(res, "Token generation failed", 500, error);
    }
  })(req, res, next);
};
