import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

export type MobileUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export async function createMobileToken(
  user: MobileUser
) {
  return new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifyMobileToken(
  token: string
): Promise<MobileUser> {
  const { payload } = await jwtVerify(
    token,
    secretKey
  );

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid authentication token.");
  }

  return {
    id: payload.sub,
    name:
      typeof payload.name === "string"
        ? payload.name
        : null,
    email: payload.email,
    role:
      typeof payload.role === "string"
        ? payload.role
        : "CUSTOMER",
  };
}