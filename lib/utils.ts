import { PrismaClient } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractData = (params: { path?: string[] }) => {
  const alias = params.path ? params.path[0] : "";
  const path =
    params.path?.length && params.path.length > 1
      ? params.path.slice(1).join("/")
      : null;

  return { alias, path };
};

export const getUrl = async (alias: string, path?: string | null) => {
  const prisma = new PrismaClient();
  const doc = await prisma.link.findFirst({ where: { alias } });
  const baseUrl = doc?.url || process.env.DEFAULT_REDIRECT || "/";
  return path ? `${baseUrl}/${path}` : baseUrl;
};

export function parseReferrer(referrer: string | null): string {
  if (!referrer) return "Direct";

  try {
    const url = new URL(referrer);

    // Remove 'www.' if present
    const hostname = url.hostname.replace(/^www\./, "");

    // Handle some common cases
    switch (hostname) {
      case "t.co":
        return "Twitter";
      case "l.facebook.com":
      case "lm.facebook.com":
      case "m.facebook.com":
        return "Facebook";
      case "linkedin.com":
      case "lnkd.in":
        return "LinkedIn";
      case "out.reddit.com":
        return "Reddit";
      case "away.vk.com":
        return "VKontakte";
      case "com.google.android.gm":
        return "Gmail";
    }

    // For other cases, just return the hostname
    // Split by dots and take up to two parts
    const parts = hostname.split(".");
    return parts.slice(-2).join(".");
  } catch (error) {
    // If parsing fails, return the original string, limited to 50 characters
    return referrer.substring(0, 50);
  }
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);

  toast("Copied to clipboard");
}

export function daysSinceDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
