import { readFile, writeFile } from 'node:fs/promises';

const filename = './users.json';

let data = {};

const writeData = async (obj) => await writeFile(filename, JSON.stringify(obj, null, 2), { encoding: 'utf8' });

try {
  data = JSON.parse(await readFile(filename, { encoding: 'utf8' }));
} catch (error) {
  writeData({});
}

export const users = new Proxy(data, {
  set: async (obj, prop, value) => {
    obj[prop] = value;
    await writeData(obj);
    return true;
  }
});