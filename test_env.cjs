const fs = require('fs');

// Check .env
if (fs.existsSync('.env')) {
  const c = fs.readFileSync('.env', 'utf8');
  const m = c.match(/GEMINI_API_KEY="?([^"\n]*)"?/);
  const key = m ? m[1] : '';
  console.log('.env: EXISTS');
  console.log('GEMINI_API_KEY present:', c.includes('GEMINI_API_KEY'));
  console.log('Key value:', key.startsWith('MY_') ? 'PLACEHOLDER' : key.length > 10 ? 'REAL_KEY (len=' + key.length + ')' : 'EMPTY_OR_SHORT');
} else {
  console.log('.env: MISSING');
}

// Check for exposed secrets in frontend code
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
const aqiTs = fs.readFileSync('src/utils/aqi.ts', 'utf8');
const mainTsx = fs.readFileSync('src/main.tsx', 'utf8');

['GEMINI_API_KEY', 'API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'].forEach(term => {
  [['App.tsx', appTsx], ['aqi.ts', aqiTs], ['main.tsx', mainTsx]].forEach(([name, code]) => {
    if (code.includes(term)) {
      console.log('WARNING: ' + name + ' contains "' + term + '"');
    }
  });
});

console.log('\nFrontend secret exposure check: DONE');

