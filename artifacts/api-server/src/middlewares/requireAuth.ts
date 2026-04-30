import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

const ALLOWED_EMAIL_DOMAIN = "carevet.com.au";

const emailCache = new Map<string, { email: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getPrimaryEmail(userId: string): Promise<string | null> {
  const cached = emailCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.email;
  }
  try {
    const user = await clerkClient.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find((e) => e.id === primaryId);
    const email = primary?.emailAddress?.toLowerCase() ?? null;
    if (email) {
      emailCache.set(userId, { email, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return email;
  } catch {
    return null;
  }
}

function isAllowedEmail(email: string | null): boolean {
  if (!email) return false;
  return email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  const userId =
    (auth?.sessionClaims as { userId?: string } | undefined)?.userId ??
    auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const email = await getPrimaryEmail(userId);
  if (!isAllowedEmail(email)) {
    req.log?.warn(
      { userId, emailDomain: email?.split("@")[1] },
      "Rejected request from non-allowed email domain",
    );
    res.status(403).json({
      error: "Forbidden",
      message: `Access is restricted to staff with @${ALLOWED_EMAIL_DOMAIN} email addresses.`,
    });
    return;
  }

  req.userId = userId;
  req.userEmail = email!;
  next();
}

export const ALLOWED_STAFF_EMAIL_DOMAIN = ALLOWED_EMAIL_DOMAIN;
