const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

// Fix setLocalCache
code = code.replace(
  `  } catch (err: any) {\n    console.error(\`API Error (\${endpoint}):\`, err);\n    throw new Error(\`API Error: \${err.message}\`);\n    console.warn('LocalStorage save error:', err);\n  }`,
  `  } catch (err) {\n    console.warn('LocalStorage save error:', err);\n  }`
);

// Fix fetchApi
code = code.replace(
  `  } catch (err: any) {\n    console.error(\`API Error (\${endpoint}):\`, err);\n    throw new Error(\`API Error: \${err.message}\`);\n    // Mode offline / API belum ter-upload ke hosting\n    return null;\n  }`,
  `  } catch (err: any) {\n    console.error(\`API Error (\${endpoint}):\`, err);\n    throw new Error(err.message);\n  }`
);

fs.writeFileSync('src/firebase.ts', code);
