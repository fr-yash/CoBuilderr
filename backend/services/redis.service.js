import { createClient } from 'redis';

// Parse Redis host to remove port if included
const redisHost = process.env.REDIS_HOST?.split(':')[0] || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || '';

const redisClient = createClient({
    socket: {
        host: redisHost,
        port: redisPort,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('Redis: Too many retries, stopping reconnection attempts');
                return new Error('Too many retries');
            }
            return Math.min(retries * 100, 3000);
        }
    },
    password: redisPassword || undefined
});

let isConnected = false;

redisClient.on('error', err => {
    console.log('Redis Client Error:', err.message);
    isConnected = false;
});

redisClient.on('connect', () => {
    console.log('Redis client connected successfully');
    isConnected = true;
});

redisClient.on('ready', () => {
    console.log('Redis client ready');
    isConnected = true;
});

redisClient.on('end', () => {
    console.log('Redis client disconnected');
    isConnected = false;
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err.message);
        console.log('Application will continue without Redis (token blacklisting disabled)');
    }
})();

// Export both client and connection status
export default redisClient;
export { isConnected };
