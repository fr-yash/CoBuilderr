import jwt from "jsonwebtoken";
import redisClient, { isConnected } from "../services/redis.service.js";

export const authUser = async(req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    // Check token blacklist only if Redis is connected
    try {
        if (redisClient.isOpen) {
            const isBlackListed = await redisClient.get(token);

            if(isBlackListed){
                res.cookie('token', '', { maxAge: 0 });
                return res.status(401).json({message: "Unauthorized"});
            }
        } else {
            console.log('Redis not connected, skipping token blacklist check');
        }
    } catch (redisError) {
        console.error('Redis error in auth middleware:', redisError.message);
        // Continue without blacklist check if Redis fails
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(401).json({message: "Unauthorized"});
    }
}