import userModel from "../models/user.model.js";
import * as projectService from "../services/project.service.js";
import {validationResult} from "express-validator";

export const createProject = async(req,res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {name} = req.body;
        console.log('Creating project with name:', name);
        console.log('User email:', req.user.email);

        const loggedInUser = await userModel.findOne({email: req.user.email});
        console.log('Logged in user:', loggedInUser);

        if(!loggedInUser){
            return res.status(404).json({message: "User not found"});
        }

        const userId = loggedInUser._id;
        console.log('User ID:', userId);

        const newProject = await projectService.createProject({name,userId});
        console.log('Project created:', newProject);

        res.status(201).json({newProject});
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({message: error.message});
    }

}

export const getAllProjects = async(req,res)=>{
    try {
        const loggedInUser = await userModel.findOne({email: req.user.email});
        const userId = loggedInUser._id;
        const projects = await projectService.getAllProjects(userId);
        res.status(200).json({projects});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const addUserToProject = async(req,res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {users,projectId} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});
        const userId = loggedInUser._id;
        const project = await projectService.addUserToProject({users,projectId,userId});
        res.status(200).json({project});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getProjectById = async(req,res)=>{
    try {
        const {projectId} = req.params;
        const project = await projectService.getProjectById(projectId);
        res.status(200).json({project});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}