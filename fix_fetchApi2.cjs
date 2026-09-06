const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

code = code.replace(
  `    if (text.trim().startsWith('<')) {
      throw new Error('Server returned HTML or raw PHP. Pastikan PHP berjalan di server Anda.');
    }`,
  `    if (text.trim().startsWith('<')) {
      console.warn('API returned non-JSON/HTML: ' + endpoint);
      return null;
    }`
);

code = code.replace(
  `  } catch (err: any) {
    console.error(\`API Error (\${endpoint}):\`, err);
    throw new Error(err.message || 'Unknown API Error');
  }`,
  `  } catch (err: any) {
    console.error(\`API Request Failed (\${endpoint}):\`, err.message);
    return null;
  }`
);

fs.writeFileSync('src/firebase.ts', code);
