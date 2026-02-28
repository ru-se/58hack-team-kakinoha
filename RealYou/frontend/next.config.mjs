import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname を手動で定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 既存の設定
  // root: __dirname, など
};

export default nextConfig;
