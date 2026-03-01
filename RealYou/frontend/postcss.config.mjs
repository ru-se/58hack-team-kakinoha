// RealYou側の next.config.mjs
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/realyou', // ← これを絶対に追加する

  // もしリンクコンポーネント等で trailingSlash の警告が出る場合はこれも追加
  // trailingSlash: false,
};

export default nextConfig;
