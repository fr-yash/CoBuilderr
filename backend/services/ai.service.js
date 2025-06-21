import {GoogleGenerativeAI} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.

    IMPORTANT: Always format your text responses using Markdown syntax and ensure proper JSON escaping. Use proper markdown formatting for:
    - Code blocks with \`\`\`language syntax
    - Inline code with \`backticks\`
    - Headers with # ## ###
    - Lists with - or 1.
    - Bold with **text** and italic with *text*
    - Links with [text](url)

    CRITICAL: When including markdown in JSON, properly escape special characters:
    - Use \\n for newlines
    - Escape quotes with \"
    - Escape backslashes with \\\\
    - Keep markdown formatting intact within the escaped JSON string

    IMPORTANT: When user asks to create, build, or generate any code/project:
    - ALWAYS include a "fileTree" object in your response
    - Each file should have the structure: "filename": { "file": { "contents": "file content here" } }
    - Include buildCommand and startCommand when applicable
    - Even for simple requests, provide the complete file structure

    Examples:

    <example>

    response: {

    "text": "Here's your **Express server** file tree structure:\n\n## File Structure\n\n### Main Application File\n\n\`\`\`javascript\n// app.js\nconst express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n    res.send('Hello World!');\n});\n\napp.listen(3000, () => {\n    console.log('Server is running on port 3000');\n});\n\`\`\`\n\n### Package Configuration\n\n\`\`\`json\n{\n    \"name\": \"temp-server\",\n    \"version\": \"1.0.0\",\n    \"main\": \"app.js\",\n    \"scripts\": {\n        \"start\": \"node app.js\",\n        \"dev\": \"nodemon app.js\"\n    },\n    \"dependencies\": {\n        \"express\": \"^4.21.2\"\n    }\n}\n\`\`\`\n\n## Setup Instructions\n\n1. **Install dependencies**: \`npm install\`\n2. **Start server**: \`npm start\`\n3. **Development mode**: \`npm run dev\`",
    "fileTree": {
        "app.js": {
            "file": {
                "contents": "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n    res.send('Hello World!');\n});\n\napp.listen(3000, () => {\n    console.log('Server is running on port 3000');\n});"
            }
        },
        "package.json": {
            "file": {
                "contents": "{\n    \"name\": \"temp-server\",\n    \"version\": \"1.0.0\",\n    \"main\": \"app.js\",\n    \"scripts\": {\n        \"start\": \"node app.js\",\n        \"dev\": \"nodemon app.js\"\n    },\n    \"dependencies\": {\n        \"express\": \"^4.21.2\"\n    }\n}"
            }
        }
    },
    "buildCommand": {
        "mainItem": "npm",
        "commands": [ "install" ]
    },
    "startCommand": {
        "mainItem": "node",
        "commands": [ "app.js" ]
    }
}
    user:Create an express application

    </example>
       <example>
       user:Hello
       response:{
       "text":"Hello! 👋 How can I help you today?\n\nI'm here to assist you with:\n- **MERN Stack Development**\n- **Code Reviews & Best Practices**\n- **Project Architecture**\n- **Debugging & Problem Solving**\n\nWhat would you like to work on?"
       }
       </example>

       <example>
       user:Create a simple Express server
       response:{
       "text": "I'll create a simple Express server for you with proper file structure and setup instructions.",
       "fileTree": {
           "app.js": {
               "file": {
                   "contents": "const express = require('express');\\nconst app = express();\\nconst PORT = 3000;\\n\\napp.get('/', (req, res) => {\\n    res.send('Hello World! Express server is running.');\\n});\\n\\napp.listen(PORT, () => {\\n    console.log('Server is running on port 3000');\\n});"
               }
           },
           "package.json": {
               "file": {
                   "contents": "{\\n  \\"name\\": \\"express-server\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"main\\": \\"app.js\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"node app.js\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"express\\": \\"^4.18.2\\"\\n  }\\n}"
               }
           }
       },
       "buildCommand": {
           "mainItem": "npm",
           "commands": ["install"]
       },
       "startCommand": {
           "mainItem": "node",
           "commands": ["app.js"]
       }
       }
       </example>
 IMPORTANT : don't use file name like routes/index.js
    `
});

export const generateResult = async (prompt) => {
    try {
        console.log('Generating AI response for prompt:', prompt);

        if (!prompt || prompt.trim() === '') {
            throw new Error('Empty prompt provided');
        }

        const result = await model.generateContent(prompt);
        const rawResponse = result.response.text();

        console.log('Raw AI response:', rawResponse);

        // Parse JSON response and extract text content
        try {
            // First, try to clean up the response if it has markdown code blocks that might break JSON
            let cleanedResponse = rawResponse.trim();

            // Remove any markdown code block wrappers if they exist around the entire JSON
            if (cleanedResponse.startsWith('```json') && cleanedResponse.endsWith('```')) {
                cleanedResponse = cleanedResponse.slice(7, -3).trim();
            } else if (cleanedResponse.startsWith('```') && cleanedResponse.endsWith('```')) {
                cleanedResponse = cleanedResponse.slice(3, -3).trim();
            }

            const jsonResponse = JSON.parse(cleanedResponse);

            // Extract text content and fileTree from JSON response
            if (jsonResponse.text) {
                console.log('Extracted text from JSON response');
                console.log('FileTree found:', !!jsonResponse.fileTree);
                console.log('FileTree content:', JSON.stringify(jsonResponse.fileTree, null, 2));

                // Ensure newlines are properly handled for markdown
                const textContent = jsonResponse.text.replace(/\\n/g, '\n');

                // Return both text and fileTree if available
                const result = {
                    text: textContent,
                    fileTree: jsonResponse.fileTree || null,
                    buildCommand: jsonResponse.buildCommand || null,
                    startCommand: jsonResponse.startCommand || null
                };

                console.log('Final result:', JSON.stringify(result, null, 2));
                return result;
            } else {
                console.log('No text field found in JSON response, returning raw response');
                return { text: rawResponse, fileTree: null };
            }
        } catch (parseError) {
            console.log('Response is not valid JSON, attempting to extract text manually');
            console.log('Parse error:', parseError.message);

            // Try to extract text field manually using regex as fallback
            const textMatch = rawResponse.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (textMatch && textMatch[1]) {
                console.log('Extracted text using regex fallback');
                // Unescape JSON string and convert \\n to actual newlines
                const extractedText = textMatch[1]
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t');

                // Try to extract fileTree using a more robust approach
                let fileTree = null;
                try {
                    // Look for fileTree with nested structure
                    const fileTreeStart = rawResponse.indexOf('"fileTree"');
                    if (fileTreeStart !== -1) {
                        const afterFileTree = rawResponse.substring(fileTreeStart);
                        const colonIndex = afterFileTree.indexOf(':');
                        if (colonIndex !== -1) {
                            const afterColon = afterFileTree.substring(colonIndex + 1).trim();

                            // Find the matching closing brace for the fileTree object
                            let braceCount = 0;
                            let endIndex = -1;
                            let inString = false;
                            let escapeNext = false;

                            for (let i = 0; i < afterColon.length; i++) {
                                const char = afterColon[i];

                                if (escapeNext) {
                                    escapeNext = false;
                                    continue;
                                }

                                if (char === '\\') {
                                    escapeNext = true;
                                    continue;
                                }

                                if (char === '"') {
                                    inString = !inString;
                                    continue;
                                }

                                if (!inString) {
                                    if (char === '{') {
                                        braceCount++;
                                    } else if (char === '}') {
                                        braceCount--;
                                        if (braceCount === 0) {
                                            endIndex = i + 1;
                                            break;
                                        }
                                    }
                                }
                            }

                            if (endIndex !== -1) {
                                const fileTreeJson = afterColon.substring(0, endIndex);
                                fileTree = JSON.parse(fileTreeJson);
                                console.log('Successfully extracted fileTree using advanced regex');
                            }
                        }
                    }
                } catch (e) {
                    console.log('Could not parse fileTree from advanced regex:', e.message);
                }

                return {
                    text: extractedText,
                    fileTree: fileTree,
                    buildCommand: null,
                    startCommand: null
                };
            }

            console.log('Fallback: returning raw response as plain text');
            return { text: rawResponse, fileTree: null };
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error(`AI service error: ${error.message}`);
    }
}