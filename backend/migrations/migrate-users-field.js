import "dotenv/config";
import mongoose from "mongoose";
import ProjectModel from "../models/project.model.js";

async function migrateUsersField() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration");

        // Find all projects where users field is not an array
        const projectsToMigrate = await mongoose.connection.db.collection('projects').find({
            users: { $not: { $type: "array" } }
        }).toArray();

        console.log(`Found ${projectsToMigrate.length} projects to migrate`);

        if (projectsToMigrate.length === 0) {
            console.log("No projects need migration. All users fields are already arrays.");
            return;
        }

        // Migrate each project
        for (const project of projectsToMigrate) {
            console.log(`Migrating project: ${project._id} - ${project.name}`);

            // Convert single ObjectId to array
            const currentUserId = project.users;

            // Validate that currentUserId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
                console.warn(`⚠️  Skipping project ${project._id} - invalid user ID: ${currentUserId}`);
                continue;
            }

            // Update the document directly in MongoDB to convert users field to array
            const result = await mongoose.connection.db.collection('projects').updateOne(
                { _id: project._id },
                { $set: { users: [currentUserId] } }
            );

            if (result.modifiedCount === 1) {
                console.log(`✓ Migrated project ${project._id}`);
            } else {
                console.warn(`⚠️  Failed to migrate project ${project._id}`);
            }
        }

        console.log(`Successfully migrated ${projectsToMigrate.length} projects`);
        
    } catch (error) {
        console.error("Migration failed:", error);
        throw error;
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log("Database connection closed");
    }
}

// Run the migration
migrateUsersField()
    .then(() => {
        console.log("Migration completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
    });
