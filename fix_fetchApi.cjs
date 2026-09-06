const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const oldFetchApi = `async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  const url = \`\${baseUrl}/\${endpoint}\`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 detik timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const text = await response.text();
    if (text.trim().startsWith('<')) {
      throw new Error('Server returned HTML or raw PHP. Pastikan PHP berjalan di server Anda.');
    }
    const json = JSON.parse(text);

    if (json.status === 'success' && json.data !== undefined) {
      return json.data as T;
    }

    return json as T;
  } catch (err: any) {
    console.error(\`API Error (\${endpoint}):\`, err);
    throw new Error(err.message || 'Unknown API Error');
  }
}`;

const newFetchApi = `async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  const url = \`\${baseUrl}/\${endpoint}\`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 detik timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const text = await response.text();
    // Jika responnya adalah PHP script mentah atau HTML, kita abaikan saja agar tidak crash di lokal/preview.
    if (text.trim().startsWith('<')) {
      if (typeof window !== 'undefined' && !window.location.hostname.includes('run.app')) {
         console.warn(\`Preview Mode: API \${endpoint} is returning raw PHP/HTML instead of JSON. Assuming offline mode.\`);
      }
      return null;
    }
    const json = JSON.parse(text);

    if (json.status === 'success' && json.data !== undefined) {
      return json.data as T;
    }

    return json as T;
  } catch (err: any) {
    console.error(\`API Request Failed (\${endpoint}):\`, err.message);
    // Kita return null agar tidak throw exception terus menerus di interval polling
    return null;
  }
}`;

code = code.replace(oldFetchApi, newFetchApi);
fs.writeFileSync('src/firebase.ts', code);
