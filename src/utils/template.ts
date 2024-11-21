// get ./api/templates/{filename}.html file and replace {{ key }} with value
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const template = async (filename: string, data: Record<string, string>) => {
  const template = fs.readFileSync(path.resolve(__dirname, `../api/templates/${filename}.html`), 'utf8');
  return Object.entries(data).reduce((acc, [key, value]) => acc.replace(new RegExp(`{{ ${key} }}`, 'g'), value), template);
}