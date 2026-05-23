import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_unsafe_secret"
);

export type SessionPayload = {
  id: string;
  email: string;
  roleId: string | null;
  permissions: string[];
};

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/"
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"]
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function requirePermission(permission: string) {
  const session = await verifySession();
  if (!session) {
    return { error: "UNAUTHORIZED", status: 401 };
  }

  if (!session.permissions.includes(permission) && !session.permissions.includes("*")) {
    return { error: "FORBIDDEN", status: 403 };
  }

  return { session, error: null };
}

export async function getUserSession() {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { role: true }
  });

  if (!user) return null;

  return {
    ...user,
    permissions: user.role?.permissions || []
  };
}
