// import { createClient } from 'redis';
const redis = require('redis');
const redisUrl = process.env.REDIS_DATABASE;

const redisClient = redis.createClient({
  url: redisUrl
});
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis 連線成功');
  } catch (err: any) {
    console.log(err.message);
  }
};
connectRedis();

redisClient.on('error', (err:any) => console.log(err));

export default redisClient;