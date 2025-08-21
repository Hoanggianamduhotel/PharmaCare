#!/usr/bin/env node

// Build script cho frontend-only deployment
// Chỉ build React app với Vite, không build Express server

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';

console.log('🔧 Building frontend-only for static deployment...');

// Clean dist directory
if (existsSync('dist')) {
  console.log('🧹 Cleaning dist directory...');
  rmSync('dist', { recursive: true, force: true });
}

// Build client with production config
console.log('⚡ Building React app with Vite...');
try {
  execSync('vite build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Frontend build completed successfully!');
  console.log('📁 Files ready in dist/public/ directory for Netlify');
  
  // List generated files
  execSync('ls -la dist/', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}