// src/utils/users.ts
// User management with secure password hashing

import bcrypt from "bcrypt";
import db from "../config/db";

// User interface with hashed password
export interface User {
  id: string;
  userName: string;
  email: string;
  password: string;
  createdAt: Date;
}

// In-memory user store (replace with database in production)
// const users = new Map<string, User>();

// Cost factor for bcrypt (10-12 is recommended for production)
const SALT_ROUNDS = 10;

// Create a new user with hashed password
export async function createUser(
  userName: string,
  email: string,
  password: string,
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user: User = {
    id: crypto.randomUUID(),
    userName,
    email,
    password: passwordHash,
    createdAt: new Date(),
  };
  try {
    // Hash password with bcrypt (never store plain text passwords)
    const query = db.prepare(
      "INSERT INTO users (id, username, email,password) VALUES (?,?,?,?)",
    );
    query.run(user.id, user.userName, user.email, passwordHash);
    // return Response.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      throw new Error("User already exists");
    }
    throw new Error("Erreur serveur");
  }

  //   users.set(user.id, user);
  return user;
}

// Validate user credentials and return user if valid
export async function validateCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  // Find user by email
  const getUser = db.query("SELECT * FROM users WHERE email = $email");
  const user: User = getUser.get({ $email: email }) as User;
  //   const user = Array.from(users.values()).find((u) => u.email === email);

  if (!user) {
    // Prevent user enumeration via timing attacks by performing a
    // dummy hash so the response time is similar to the valid path.
    await bcrypt.hash(password, SALT_ROUNDS);
    return null;
  }

  // Compare password with stored hash
  const isValid = await bcrypt.compare(password, user.password);

  return isValid ? user : null;
}

// Get user by ID
export function getUserById(id: string): User | undefined {
  //   return users.get(id);
  const getUser = db.query("SELECT * FROM users WHERE id = $id");
  const user: User = getUser.get({ $id: id }) as User;
  return user
}
