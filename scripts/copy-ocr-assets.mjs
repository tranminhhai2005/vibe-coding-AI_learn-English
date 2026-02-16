import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const publicOcrDir = join(projectRoot, 'public', 'tesseract');
const tesseractDir = join(projectRoot, 'node_modules', 'tesseract.js', 'dist');
const coreDir = join(projectRoot, 'node_modules', 'tesseract.js-core');

mkdirSync(publicOcrDir, { recursive: true });

for (const [source, target] of [
  [join(tesseractDir, 'worker.min.js'), join(publicOcrDir, 'worker.min.js')],
  [
    join(coreDir, 'tesseract-core-simd-lstm.wasm.js'),
    join(publicOcrDir, 'tesseract-core-simd-lstm.wasm.js'),
  ],
  [
    join(coreDir, 'tesseract-core-lstm.wasm.js'),
    join(publicOcrDir, 'tesseract-core-lstm.wasm.js'),
  ],
]) {
  copyFileSync(source, target);
}
