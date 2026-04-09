const fs = require('fs');
const filePath = 'c:/Users/yashk/OneDrive/Desktop/CoBuilder/frontend/src/screens/Project.jsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');
lines.splice(5, 303, 
'import MessageContent from "../components/MessageContent";',
'import FileTreePanel from "../components/FileTreePanel";',
'import FileViewer from "../components/FileViewer";'
);
fs.writeFileSync(filePath, lines.join('\n'));
console.log('Successfully modified Project.jsx');
