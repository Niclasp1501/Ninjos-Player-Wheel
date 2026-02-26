const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && !dirPath.includes('.git') && !dirPath.includes('node_modules')) {
            walkDir(dirPath, callback);
        } else if (!isDirectory) {
            callback(dirPath);
        }
    });
}

walkDir('.', function (filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.json') || filePath.endsWith('.md') || filePath.endsWith('.yml')) {
        const content = fs.readFileSync(filePath, 'utf8');
        let newContent = content
            .replace(/ninos-player-wheel/g, "ninjos-player-wheel")
            .replace(/Ninos-Player-Wheel/g, "Ninjos-Player-Wheel")
            .replace(/Nino's Player Wheel/g, "Ninjo's Player Wheel")
            .replace(/Nino's/g, "Ninjo's");

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
