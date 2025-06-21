import ProjectModel from "../models/project.model.js";
import mongoose from "mongoose";

export const createProject = async({name,userId})=>{
    if(!name || !userId){
        throw new Error("Name and userId are required");
    }

    try {
        const project = await ProjectModel.create({
            name,
            users: [userId],
        });
        return project;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Project name already exists");
        }
        throw error;
    }
}

export const getAllProjects = async(userId)=>{
    const projects = await ProjectModel.find({users: userId});
    return projects;
}

export const addUserToProject = async({users,projectId,userId})=>{
    if(!projectId){
        throw new Error("projectId is required");
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId");
    }

    if(!users){
        throw new Error("Users are required");
    }

    if(!userId){
        throw new Error("userId is required");
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("Invalid userId");
    }

    if(!Array.isArray(users) || users.some(userID => !mongoose.Types.ObjectId.isValid(userID))){
        throw new Error("Invalid userId(s) in users array");
    }

    const project = await ProjectModel.findOne({
        _id: projectId,
        users: userId,
    })

    if(!project){
        throw new Error("User does not belong to this project");
    }

    const updatedProject = await ProjectModel.findOneAndUpdate({
        _id: projectId,
    },{
        $addToSet: {
            users: {
                $each: users,
            },
        },
    },{
        new: true,
    }).populate('users');

    return updatedProject;
}

export const getProjectById = async(projectId)=>{
    if(!projectId){
        throw new Error("projectId is required");
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId");
    }

    const project = await ProjectModel.findOne({_id: projectId}).populate('users');
    return project;
}