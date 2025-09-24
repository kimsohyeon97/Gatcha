import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = redis.createClient({
  url: `reids://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

export default client;
