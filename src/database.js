import fs from "node:fs/promises";

const pathName = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(pathName, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#writeFile();
      });
  }

  #writeFile() {
    fs.writeFile(pathName, JSON.stringify(this.#database));
  }

  insert(data, table) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#writeFile();
  }

  select(table, search = {}) {
    let data = this.#database[table] ?? [];

    if (search && Object.keys(search).length > 0) {
      data = data.filter((row) => {
        return Object.entries(search).every(([key, value]) => {
          return row[key] === value;
        });
      });
    }

    return data;
  }

  update(id, data, table) {
    const index = this.#database[table].findIndex((item) => item.id === id);
    if (index > -1) {
      this.#database[table][index] = data;
      this.#writeFile();
    }
  }

  delete(id, table) {
    this.#database[table] = this.#database[table].filter((item) => item.id !== id);
    this.#writeFile();
  }
}