import { SignJWT, jwtVerify } from "jose";

// SECURITY: Never use fallback in production — checked lazily to avoid build-time crash
let _encodedKey: Uint8Array | null = null;
function getEncodedKey(): Uint8Array {
  if (_encodedKey) return _encodedKey;
  const secretKey = process.env.NEXTAUTH_SECRET;
  if (!secretKey && process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL: NEXTAUTH_SECRET must be set in production!");
  }
  _encodedKey = new TextEncoder().encode(secretKey || "dev-secret-local-only");
  return _encodedKey;
}

export interface SessionPayload {
  userId: string;
  societyId: string;
  role: string;
  name: string;
  email: string;
  flatId?: string;
  expiresAt: Date;
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey());
}

export async function decryptSession(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
