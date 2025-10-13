const fs = require('fs');
const path = require('path');

// Get directory from command line argument
const targetDir = process.argv[2];

if (!targetDir) {
    console.error('Usage: node insert-vr-controls.js <directory>');
    process.exit(1);
}

if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
}

// Recursively find all .js files
function findJsFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...findJsFiles(fullPath));
        } else if (stat.isFile() && item.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Process a single file
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Look for camera:{ ... vr:{ ... } ... }
    // Find all camera objects
    const lines = content.split('\n');
    let newLines = [];
    let inCamera = false;
    let inVr = false;
    let cameraDepth = 0;
    let vrDepth = 0;
    let vrEndLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for camera start
        if (line.match(/camera\s*:\s*\{/)) {
            inCamera = true;
            cameraDepth = 1;
        }
        
        // Track depth in camera
        if (inCamera) {
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            cameraDepth += openBraces - closeBraces;
            
            // Check for vr start within camera
            if (line.match(/vr\s*:\s*\{/) && !line.match(/controls\s*:/)) {
                inVr = true;
                vrDepth = 1;
            }
            
            // Track depth in vr
            if (inVr) {
                const vrOpen = (line.match(/\{/g) || []).length;
                const vrClose = (line.match(/\}/g) || []).length;
                vrDepth += vrOpen - vrClose;
                
                // Found the closing brace of vr
                if (vrDepth === 0) {
                    vrEndLine = i;
                    inVr = false;
                    
                    // Check if controls already exists
                    let hasControls = false;
                    for (let j = i - 1; j >= 0; j--) {
                        if (lines[j].match(/vr\s*:\s*\{/)) {
                            break;
                        }
                        if (lines[j].match(/controls\s*:\s*\{/)) {
                            hasControls = true;
                            break;
                        }
                    }
                    
                    if (!hasControls) {
                        // Insert controls before the closing brace
                        const indent = line.match(/^(\s*)/)[1];
                        const prevLine = lines[i - 1];
                        
                        // Add comma to previous line if needed
                        if (prevLine.trim() && !prevLine.trim().endsWith(',')) {
                            newLines[newLines.length - 1] = prevLine + ',';
                        }
                        
                        // Insert controls
                        newLines.push(`${indent}    controls: {`);
                        newLines.push(`${indent}        _keymap: 'vr',`);
                        newLines.push(`${indent}        keymap_speed: 1.0`);
                        newLines.push(`${indent}    }`);
                        
                        modified = true;
                    }
                }
            }
            
            if (cameraDepth === 0) {
                inCamera = false;
            }
        }
        
        newLines.push(line);
    }
    
    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`✓ Modified: ${filePath}`);
    }
    
    return modified;
}

// Main execution
console.log(`Scanning directory: ${targetDir}\n`);

const jsFiles = findJsFiles(targetDir);
console.log(`Found ${jsFiles.length} JavaScript files\n`);

let modifiedCount = 0;

for (const file of jsFiles) {
    try {
        if (processFile(file)) {
            modifiedCount++;
        }
    } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
    }
}

console.log(`\nCompleted! Modified ${modifiedCount} file(s).`);