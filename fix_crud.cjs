const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const replaceCrud = (funcName) => {
  const searchRegex = new RegExp(`export async function ${funcName}\\(.*?\\): Promise<void> {\\s*(?:for \\(.*?\\) {\\s*)?const res = await fetchApi<any>\\('.*?', {[\\s\\S]*?}\\);\\s*if \\(res && res\\.status === 'error'\\) throw new Error\\(res\\.message \\|\\| '.*?'\\);(?:\\s*})?`, 'g');
  
  code = code.replace(searchRegex, (match) => {
    return match.replace(/if \(res && res\.status === 'error'\) throw new Error\(res\.message \|\| '(.*?)'\);/, 
      `if (res === null) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('run.app')) {
      // Fallback for AI Studio Preview
    } else {
      throw new Error('Gagal menghubungi server database API (Response kosong/HTML).');
    }
  } else if (res.status === 'error') {
    throw new Error(res.message || '$1');
  }`);
  });
};

replaceCrud('addEventToFirestore');
replaceCrud('batchAddEventsToFirestore');
replaceCrud('updateEventInFirestore');
replaceCrud('deleteEventFromFirestore');
replaceCrud('addAnnouncementToFirestore');
replaceCrud('updateAnnouncementInFirestore');
replaceCrud('deleteAnnouncementFromFirestore');
replaceCrud('addNotificationToFirestore');

fs.writeFileSync('src/firebase.ts', code);
