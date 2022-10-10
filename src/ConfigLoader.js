const path = require('path');
const fs = require('fs');

class ConfigLoader {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.defaultSettingPath = path.join(this.rootPath, 'config', 'default.json');
        this.customSettingPath = path.join(this.rootPath, 'config', 'config.json');
    }

    loadDefault() {
        return this.loadJsonFile(this.defaultSettingPath);
    }

    load() {
        return {
            ...this.loadDefault(),
            ...this.loadJsonFile(this.customSettingPath)
        };
    }

    loadJsonFile(filePath) {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath));
        }

        return {};
    }

    save(config, callback) {
        fs.writeFile(this.customSettingPath, JSON.stringify(config), (err) => {
            if (typeof callback === 'function') {
                callback(err);
            }
        });
    }
}

module.exports = ConfigLoader;
