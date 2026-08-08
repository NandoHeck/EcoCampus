'use strict';

const fs = require('fs');
const path = require('path');

class JsonDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this._writeQueue = Promise.resolve();
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({ users: [], ads: [] }, null, 2), 'utf8');
    }
  }

  async read() {
    const raw = await fs.promises.readFile(this.filePath, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { users: [], ads: [] };
      if (!Array.isArray(parsed.users)) parsed.users = [];
      if (!Array.isArray(parsed.ads)) parsed.ads = [];
      return parsed;
    } catch (_e) {
      return { users: [], ads: [] };
    }
  }

  async write(data) {
    this._writeQueue = this._writeQueue.then(() =>
      fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8')
    );
    return this._writeQueue;
  }

  async mutate(mutator) {
    const data = await this.read();
    const result = await mutator(data);
    await this.write(data);
    return result;
  }
}

module.exports = JsonDatabase;
