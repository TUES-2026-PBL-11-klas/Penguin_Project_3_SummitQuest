export const BASE_URL = 'http://localhost:8000';

let _token: string | null = null;

export const getToken = () => _token;
export const setToken = (token: string) => { _token = token; };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const apiClient = {
  register(data: { email: string; password: string; persona: string; weight_kg: number }) {
    return request<{ id: string; email: string; persona: string; verification_token: string }>(
      '/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    );
  },

  async login(data: { email: string; password: string }): Promise<{ access_token: string }> {
    return request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  getMe(token: string) {
    return request<{ id: string; email: string; persona: string; level: number; xp: number }>(
      '/auth/me',
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  generateQuest(data: {
    user_id: string;
    persona: string;
    lat: number;
    lon: number;
    transport_mode: string;
  }) {
    return request<{
      id: string;
      trail_name: string;
      persona_used: string;
      difficulty: number;
      distance_to_start_km: number;
      estimated_duration_min: number;
      transport_mode: string;
      status: string;
      clothing_tip: string;
      forecast: { list?: { main: { temp: number }; weather: { description: string }[] }[] };
      trail_lat: number;
      trail_lon: number;
      elevation_m: number;
      travel_time_min: number;
    }>('/api/quest/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  verifyCheckin(data: {
    quest_id: string;
    user_lat: number;
    user_lon: number;
    user_id: string;
  }) {
    return request<{ quest_id: string; user_id: string; verified: boolean; status: string; message: string }>(
      '/api/checkin/verify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    );
  },
};
