import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import prettier from 'prettier';

const input = JSON.parse(await readStdin());
const requestedPath = input?.tool_input?.file_path;

if (!requestedPath) process.exit(0);

const projectRoot = path.resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const absolutePath = path.resolve(projectRoot, requestedPath);
const relativePath = path.relative(projectRoot, absolutePath);

if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) process.exit(0);
if (/routeTree\.gen\.ts$/.test(relativePath)) process.exit(0);

try {
  const fileInfo = await prettier.getFileInfo(absolutePath, {
    ignorePath: path.join(projectRoot, '.prettierignore'),
  });

  if (fileInfo.ignored || !fileInfo.inferredParser) process.exit(0);

  const source = await readFile(absolutePath, 'utf8');
  const config = (await prettier.resolveConfig(absolutePath)) ?? {};
  const formatted = await prettier.format(source, {
    ...config,
    filepath: absolutePath,
  });

  if (formatted !== source) await writeFile(absolutePath, formatted, 'utf8');
} catch (error) {
  console.error(`Could not format ${relativePath}: ${error.message}`);
  process.exit(2);
}

async function readStdin() {
  let data = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) data += chunk;
  return data;
}
