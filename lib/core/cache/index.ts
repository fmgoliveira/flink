import { Link } from "@prisma/client";
import Redis from "ioredis";

export class Cache {
  private redis: Redis;

  constructor() {
    if (!process.env.UPSTASH_REDIS_URL)
      throw new Error("Missing environment variable UPSTASH_REDIS_URL");

    const globalForRedis = global as unknown as { redis: Redis };

    this.redis =
      globalForRedis.redis ?? new Redis(process.env.UPSTASH_REDIS_URL);

    if (process.env.NODE_ENV !== "production")
      globalForRedis.redis = this.redis;
  }

  async get(key: string): Promise<Link | null> {
    try {
      const retrievedLink = await this.redis.hgetall(key);
      return convertToLink(retrievedLink);
    } catch (error) {
      return null;
    }
  }

  async set(cacheKey: string, link: Link): Promise<boolean> {
    try {
      await this.redis.hset(cacheKey, link);
      return true;
    } catch (error) {
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }
}

function convertToLink(link: Record<string, string>): Link | null {
  return {
    id: link.id,
    url: link.url!,
    alias: link.alias!,
    createdAt: new Date(link.createdAt!),
    disableAfterClicks: link.disableAfterClicks
      ? Number(link.disableAfterClicks)
      : null,
    disableAfterDate: link.disableAfterDate
      ? new Date(link.disableAfterDate)
      : null,
    disabled: link.disabled === "true",
    passwordHash: link.passwordHash!,
    keepPath: link.keepPath === "true",
    userId: link.userId!,
    domain: link.domain,
  };
}
