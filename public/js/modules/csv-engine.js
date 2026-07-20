// CSV Data Engine - Cyber-Hub v12
// Handles Export (Download) and Import (Restore) via CSV

/**
 * Generates a single CSV string from the internal data store state.
 * format: TYPE,FIELD1,FIELD2,...
 */
export const exportToCSV = (data) => {
  let csv = "DataType,ID,Field1,Field2,Field3,Field4,Field5,Field6\n";

  // 1. Export Users
  Object.values(data.users || {}).forEach(u => {
    csv += `USER,${u.uid},${u.username || ''},${u.email || ''},${u.phone || ''},${u.status || ''},${u.avatar || ''},${u.online || false}\n`;
  });

  // 2. Export Chats
  Object.values(data.chats || {}).forEach(c => {
    csv += `CHAT,${c.id},${c.name || ''},${c.type || ''},${(c.members || []).join(';')},${c.lastMessage || ''},${c.updatedAt || ''},\n`;
  });

  // 3. Export Messages
  Object.entries(data.messages || {}).forEach(([chatId, msgs]) => {
    msgs.forEach(m => {
      csv += `MESSAGE,${chatId},${m.senderId || ''},${m.senderName || ''},${(m.text || '').replace(/,/g, ' ')},${m.type || 'text'},${m.timestamp || ''},\n`;
    });
  });

  return csv;
};

/**
 * Parses a Cyber-Hub CSV string back into a state object.
 */
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const newState = { users: {}, chats: {}, messages: {} };

  lines.forEach((line, index) => {
    if (index === 0 || !line.trim()) return; // skip header or empty lines
    const [type, id, f1, f2, f3, f4, f5, f6] = line.split(',');

    switch (type) {
      case 'USER':
        newState.users[id] = { uid: id, username: f1, email: f2, phone: f3, status: f4, avatar: f5, online: f6 === 'true' };
        break;
      case 'CHAT':
        newState.chats[id] = { id: id, name: f1, type: f2, members: f3.split(';').filter(m => m), lastMessage: f4, updatedAt: f5 };
        break;
      case 'MESSAGE':
        if (!newState.messages[id]) newState.messages[id] = [];
        newState.messages[id].push({ senderId: f1, senderName: f2, text: f3, type: f4, timestamp: parseInt(f5) || Date.now() });
        break;
    }
  });

  return newState;
};

/**
 * Triggers a browser download of the CSV data.
 */
export const downloadCSV = (filename, content) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
