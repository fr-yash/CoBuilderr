import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import {generateResult} from "./services/ai.service.js";

// Helper function to generate unique IDs
const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const port = process.env.PORT || 3001;

const server = http.createServer(app);

// Parse CORS origins from environment variable for Socket.IO
const corsOrigins = process.env.FRONTEND_URLS 
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
  : process.env.NODE_ENV === 'production' 
    ? [] // No fallback in production - must be explicitly set
    : ["http://localhost:5173"]; // Development fallback

const io = new Server(server,{
    cors: {
        origin: corsOrigins,
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.use(async(socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        const projectId = socket.handshake.query.projectId;

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            throw new Error("Invalid projectId");
        }

        socket.project = await projectModel.findById(projectId);

        if(!socket.project){
            throw new Error("Project not found");
        }

        if(!token){
            throw new Error("Unauthorized");
        }
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            throw new Error("Unauthorized");
        }
        socket.user = decoded;
        next();
    } catch (error) {
        next(error)
    }
});


io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();
    
    console.log("New client connected");
    socket.join(socket.roomId);

    socket.on('project-message', async(message) => {
        console.log('Received message:', message);

        // Always emit the original message first (immediately)
        io.to(socket.roomId).emit('project-message', message);

        // Then check if AI processing is needed
        const data = message.text;
        const aiIsIncludedInMessage = data.includes("@ai");

        if(aiIsIncludedInMessage){
            try {
                console.log('AI message detected, generating response...');
                const prompt = data.replace("@ai","").trim();
                console.log('Prompt for AI:', prompt);

                const aiResponse = await generateResult(prompt);
                console.log('AI Response:', aiResponse);

                // Handle both old string format and new object format
                const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse.text;
                const fileTree = typeof aiResponse === 'object' ? aiResponse.fileTree : null;
                const buildCommand = typeof aiResponse === 'object' ? aiResponse.buildCommand : null;
                const startCommand = typeof aiResponse === 'object' ? aiResponse.startCommand : null;

                console.log('AI Response type:', typeof aiResponse);
                console.log('FileTree extracted:', !!fileTree);
                console.log('FileTree content:', JSON.stringify(fileTree, null, 2));

                const aiMessage = {
                    id: generateUniqueId(),
                    text: responseText,
                    sender: "AI",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fileTree: fileTree,
                    buildCommand: buildCommand,
                    startCommand: startCommand
                };

                console.log('Sending AI message with fileTree:', !!aiMessage.fileTree);
                io.to(socket.roomId).emit('project-message', aiMessage);
            } catch (error) {
                console.error('Error handling AI request:', error);

                // Send error message to client
                const errorMessage = {
                    id: generateUniqueId(),
                    text: "Sorry, I encountered an error while processing your request.",
                    sender: "AI",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                io.to(socket.roomId).emit('project-message', errorMessage);
            }
        }
    });

    socket.on('disconnect', () => { 
        console.log("Client disconnected");
        socket.leave(socket.roomId);
    });
});

server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
 