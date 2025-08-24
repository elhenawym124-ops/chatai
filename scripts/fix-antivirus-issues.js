#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing antivirus false positive issues...');

// List of problematic files that antivirus might flag
const problematicFiles = [
  'frontend/node_modules/lucide-react/dist/esm/lucide-react.js',
  'frontend/node_modules/lucide-react/dist/esm/icons/chrome.js'
];

// Function to comment out problematic imports
function fixLucideReactFile() {
  const filePath = path.join(__dirname, '..', 'frontend/node_modules/lucide-react/dist/esm/lucide-react.js');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Lucide React file not found, skipping...');
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Comment out the problematic Chrome import
    const chromeImportRegex = /export \{ default as Chrome, default as ChromeIcon, default as LucideChrome \} from '\.\/icons\/chrome\.js';/g;
    
    if (chromeImportRegex.test(content)) {
      content = content.replace(
        chromeImportRegex,
        '// export { default as Chrome, default as ChromeIcon, default as LucideChrome } from \'./icons/chrome.js\'; // Commented out due to antivirus false positive'
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Fixed Chrome icon import in lucide-react');
    } else {
      console.log('✅ Chrome icon import already fixed or not found');
    }
  } catch (error) {
    console.error('❌ Error fixing lucide-react file:', error.message);
  }
}

// Function to create a safe chrome.js file if it's missing
function createSafeChromeFile() {
  const filePath = path.join(__dirname, '..', 'frontend/node_modules/lucide-react/dist/esm/icons/chrome.js');
  
  if (fs.existsSync(filePath)) {
    console.log('✅ Chrome icon file already exists');
    return;
  }

  const safeContent = `/**
 * Safe Chrome icon replacement
 * This file was created to avoid antivirus false positives
 */
import { forwardRef } from 'react';

const Chrome = forwardRef((props, ref) => {
  return null; // Disabled to avoid antivirus issues
});

Chrome.displayName = "Chrome";
export { Chrome as default };
`;

  try {
    fs.writeFileSync(filePath, safeContent, 'utf8');
    console.log('✅ Created safe Chrome icon file');
  } catch (error) {
    console.error('❌ Error creating Chrome icon file:', error.message);
  }
}

// Main execution
function main() {
  console.log('🚀 Starting antivirus compatibility fixes...\n');
  
  fixLucideReactFile();
  createSafeChromeFile();
  
  console.log('\n✅ All fixes completed!');
  console.log('💡 Tip: Add your project folder to antivirus exclusions for best results');
  console.log('📁 Folder to exclude: ' + path.resolve(__dirname, '..'));
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fixLucideReactFile, createSafeChromeFile };
