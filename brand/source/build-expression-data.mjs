import { readFile, writeFile } from 'node:fs/promises';
const source = new URL('../expressions/acting.json', import.meta.url);
const target = new URL('../expressions/acting-data.js', import.meta.url);
const data = JSON.parse(await readFile(source, 'utf8'));
if (data.groups.length !== 4 || data.groups.some(g => g.states.length !== 6)) throw new Error('Expected four sheets with six states each.');
await writeFile(target, '// Generated from acting.json for file:// review.\nwindow.HEYNAG_EXPRESSIONS = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Built expression catalogue for local browser review.');
