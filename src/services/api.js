import axios from 'axios';

// Use VITE_API_URL for production (e.g., Railway), default to localhost:3000 for local dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const api = axios.create({ baseURL: API_BASE, timeout: 20000 });

// ─── Existing ─────────────────────────────────────────────────────────────────
export const getHealth = () => api.get('/health');
export const getBeachRSI = (city, params) => api.get(`/beach/${city}`, { params });
export const listBeaches = () => api.get('/beach/list');
export const rankBeaches = () => api.get('/beach/rank');
export const compareBeaches = (cities) => api.get(`/beach/compare?cities=${cities}`);
export const filterBeaches = (params) => api.get('/beach/filter', { params });
export const getBeachHistory = (city) => api.get(`/beach/history/${city}`);

// ─── New ───────────────────────────────────────────────────────────────────────
export const getQuestionnaire = () => api.get('/beach/questionnaire');
export const getNearby = (lat, lon) => api.get(`/beach/nearby?lat=${lat}&lon=${lon}`);
export const getRecommendations = (body) => api.post('/beach/recommend', body);

// ─── SSE (Server-Sent Events) ─────────────────────────────────────────────────
export const createAlertStream = (beaches, onMessage, onError) => {
  const url = `${API_BASE}/beach/alerts/stream?beaches=${beaches.join(',')}`;
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)); } catch { /* ignore parse errors */ }
  };
  es.onerror = onError || (() => { });
  return es; // caller must call es.close() on cleanup
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getRSIColor = (score) => {
  if (score >= 80) return 'var(--rsi-safe)';
  if (score >= 60) return 'var(--rsi-moderate)';
  if (score >= 36) return 'var(--rsi-risky)';
  return 'var(--rsi-unsafe)';
};

export const getRSIClass = (classification) =>
  classification?.toLowerCase() || 'moderate';

export const getSuitabilityColor = (label) => {
  if (!label) return 'var(--text-muted)';
  const l = label.toLowerCase();
  if (l === 'ideal') return 'var(--rsi-safe)';
  if (l === 'caution') return 'var(--rsi-risky)';
  if (l === 'danger') return 'var(--rsi-unsafe)';
  return 'var(--rsi-moderate)';
};

export const ACTIVITY_ICONS = {
  surfing: '🏄', swimming: '🤽', snorkeling: '🤿',
  'scuba-diving': '🧜', kayaking: '🚣', parasailing: '🪂',
  'jet-skiing': '🛥️', 'water-sports': '💦', sunbathing: '🌅',
  walking: '🚶', yoga: '🧘', trekking: '🥾', photography: '📸',
  cycling: '🚴', 'dolphin-watching': '🐬', camping: '⛺',
  fishing: '🎣', 'horse-riding': '🐴', 'street-food': '🍢',
  nightlife: '🎶', ayurveda: '🌿', 'sand-art': '🏖️',
  'shell-collecting': '🐚', 'cliff-walking': '🧗',
};
