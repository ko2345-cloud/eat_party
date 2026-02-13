const fs = require('fs');
const path = require('path');

const files = [
    { key: 'avocado', path: 'fruitsandvegetables/avocado.fbx' },
    { key: 'avocado-bone', path: 'fruitsandvegetables/avocado-bone.fbx' },
    { key: 'avocado-boneless', path: 'fruitsandvegetables/avocado-boneless.fbx' }
];

let output = 'const AVOCADO_MODELS_BASE64 = {\n';

files.forEach(file => {
    try {
        const filePath = path.join(__dirname, file.path);
        console.log(`Reading: ${filePath}`);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'base64');
            output += `    '${file.key}': 'data:application/octet-stream;base64,${data}',\n`;
            console.log(`Computed base64 for ${file.key}`);
        } else {
            console.error(`File not found: ${filePath}`);
        }
    } catch (e) {
        console.error(`Error reading ${file.path}:`, e);
    }
});

output += '};\n';

fs.writeFileSync(path.join(__dirname, 'avocado_data.js'), output);
console.log('avocado_data.js created successfully.');
