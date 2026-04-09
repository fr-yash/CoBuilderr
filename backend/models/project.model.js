import mongoose from "mongoose";

const projectScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase : true,
        unique: [true, "Project name already exists"],
    },

    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],

    fileTree: {
        type: Object,
        default: null
    },

    messages: {
        type: Array,
        default: []
    }
})

const Project = mongoose.model("Project",projectScheme);

export default Project;