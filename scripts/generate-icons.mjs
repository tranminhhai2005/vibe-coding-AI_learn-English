/**
 * Script tạo icon PNG cho Android từ SVG source.
 * Chạy bằng: node scripts/generate-icons.mjs
 *
 * Yêu cầu: npm install sharp (chạy 1 lần)
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Kích thước icon cho Android
const ICON_SIZES = [
  { dir: 'mipmap-mdpi',    size: 48 },
  { dir: 'mipmap-hdpi',    size: 72 },
  { dir: 'mipmap-xhdpi',   size: 96 },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// Vẽ icon trên canvas
function drawIcon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const r = size * 0.22; // border radius

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(0.5, '#4f46e5');
  grad.addColorStop(1, '#0ea5e9');

  // Rounded rect background
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Chữ "E"
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.55}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size / 2, size / 2 + size * 0.04);

  // Sparkle nhỏ
  const sp = size * 0.12;
  const sx = size * 0.78, sy = size * 0.2;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(sx, sy, sp * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(sx + sp, sy + sp * 0.8, sp * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// Cố gắng dùng canvas để tạo PNG
try {
  for (const { dir, size } of ICON_SIZES) {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);

    const outDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'res', dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const buffer = canvas.toBuffer('image/png');
    const icFile = path.join(outDir, 'ic_launcher.png');
    const icRoundFile = path.join(outDir, 'ic_launcher_round.png');
    fs.writeFileSync(icFile, buffer);
    fs.writeFileSync(icRoundFile, buffer);
    console.log(`✓ Generated ${dir}/ic_launcher.png (${size}×${size})`);
  }
  console.log('\n✅ Tất cả icon đã được tạo thành công!');
} catch (err) {
  console.error('❌ Không thể tạo icon:', err.message);
  console.log('\n💡 Thử chạy: npm install canvas\n   hoặc dùng Android Studio để tạo icon thủ công.');
}
