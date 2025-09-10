const fs = require('fs');
const path = require('path');

class FileManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  readJSON(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Erreur lecture ${filename}:`, error);
      return null;
    }
  }

  writeJSON(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Erreur écriture ${filename}:`, error);
      return false;
    }
  }

  initializeFile(filename, defaultData) {
    const filePath = path.join(this.dataDir, filename);
    if (!fs.existsSync(filePath)) {
      this.writeJSON(filename, defaultData);
    }
  }

  // Fonction pour lire les données par nom de fichier (sans extension)
  readData(dataType) {
    return this.readJSON(`${dataType}.json`);
  }
}

module.exports = new FileManager();
