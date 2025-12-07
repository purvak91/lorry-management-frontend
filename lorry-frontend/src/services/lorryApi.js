const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1001';
const BASE_URL = `${API_BASE_URL}/api/lorry`;

async function parseError(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      const data = await res.json();
      if (data && (data.message || data.error)) {
        return data.message || data.error;
      }
      return JSON.stringify(data);
    } catch {
    }
  } else {
    try {
      const text = await res.text();
      if (text) return text;
    } catch {
    }
  }
  return `HTTP ${res.status}`;
}

export async function getLorries(page= 0, size = 5) {
  const res = await fetch(`${BASE_URL}?page=${page}&size=${size}`);
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function deleteLorry(lr) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(lr)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

export async function createLorry(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateLorry(lr, payload) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(lr)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getNextLr() {
  const res = await fetch(`${BASE_URL}/next-lr`);
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json(); 
}
