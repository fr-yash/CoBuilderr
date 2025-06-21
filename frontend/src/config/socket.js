import socket from "socket.io-client";

let socketInstance = null;

export const createSocketConnection = (projectId) => {
    if(!socketInstance){
        socketInstance = socket(import.meta.env.VITE_API_URL,{
            auth: {
                token: localStorage.getItem("token"),
            },
            query: {
                projectId,
            },
        });
    }
}

export const receiveMessage = (eventName, callback) => {
    if (socketInstance) {
        socketInstance.on(eventName, callback);
    }
}

export const sendMessage = (message) => {
    if (socketInstance) {
        socketInstance.emit("project-message", message);
    }
}

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}