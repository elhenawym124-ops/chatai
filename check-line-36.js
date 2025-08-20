const fs = require('fs');

const content = fs.readFileSync('frontend/src/services/successAnalyticsAPI.js', 'utf8');
const lines = content.split('\n');

console.log('🔍 فحص السطر 36:');
console.log('المحتوى:', lines[35]);
console.log('الطول:', lines[35].length);

console.log('\nفحص الأحرف:');
for (let i = 0; i < lines[35].length; i++) {
  const char = lines[35][i];
  const code = char.charCodeAt(0);
  console.log(`${i}: '${char}' (${code})`);
}

console.log('\nفحص السطور المحيطة:');
for (let i = 33; i <= 38; i++) {
  console.log(`السطر ${i + 1}: "${lines[i]}"`);
}
