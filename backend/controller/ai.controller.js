import {generateResult} from "../services/ai.service.js";

export const generateResultController = async(req,res)=>{
    try {
        const {prompt} = req.params;
        const result = await generateResult(prompt);
        res.send(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}