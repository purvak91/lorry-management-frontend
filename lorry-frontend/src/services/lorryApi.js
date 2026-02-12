const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

const BASE_URL = `${API_BASE_URL}/api/lorry`;

async function parseError(res) {
  const ct = res.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    const data = await res.json();
    throw data; 
  }

  throw { message: `HTTP ${res.status}` };
}

export async function getLorries(
  page= 0, 
  size = 5, 
  filters = {}, 
  signal
) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);

  if (filters.searchText) params.append("search", filters.searchText);
  if (filters.startDate) params.append("from", filters.startDate);
  if (filters.toDate) params.append("to", filters.toDate);

  const res = await fetch(`${BASE_URL}?${params.toString()}`, { signal });

  if (!res.ok) {
    await parseError(res);
  }

  return res.json();
}

export async function deleteLorry(lr) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(lr)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    await parseError(res);
  }
}

export async function createLorry(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await parseError(res);
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
    await parseError(res);
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
    await parseError(res);
  }
  return res.json(); 
}

export async function getDistinctLorryNumbers() {
  const res = await fetch(`${BASE_URL}/distinct/lorry-numbers`);
  if (!res.ok) {
    await parseError(res);
  }
  return res.json();
}

export async function getDistinctFromLocations() {
  const res = await fetch(`${BASE_URL}/distinct/from-locations`);
  if (!res.ok) {
    await parseError(res);
  }
  return res.json(); 
}

export async function getDistinctToLocations() {
  const res = await fetch(`${BASE_URL}/distinct/to-locations`);
  if (!res.ok) {
    await parseError(res);
  }
  return res.json(); 
}

export async function getDistinctConsignors() {
  const res = await fetch(`${BASE_URL}/distinct/consignors`);
  if (!res.ok) {
    await parseError(res);
  }
  return res.json(); 
}