const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'node_modules', '@tensorflow', 'tfjs-backend-wasm', 'dist');
const destDir = path.join(__dirname, 'public', 'static', 'js');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  'tfjs-backend-wasm.wasm',
  'tfjs-backend-wasm-simd.wasm',
  'tfjs-backend-wasm-threaded-simd.wasm',
];

filesToCopy.forEach(file => {
  fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
});

console.log('WASM files copied successfully!');
