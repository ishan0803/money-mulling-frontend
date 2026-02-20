/**
 * API client with Clerk authentication token injection.
 *
 * Every request automatically fetches the active Clerk session token
 * and attaches it as a Bearer token in the Authorization header.
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Token Injection ──────────────────────────────────────────
let _getToken = null;

/**
 * Call this once from a component that has access to Clerk's useAuth().
 * Stores the getToken function so the interceptor can use it.
 */
export function setTokenProvider(getTokenFn) {
  _getToken = getTokenFn;
}

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token unavailable — request proceeds unauthenticated
    }
  }
  return config;
});


// ═══════════════════════════════════════════════════════════════
//  Upload
// ═══════════════════════════════════════════════════════════════

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/api/v1/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { dataset_id, filename, row_count, message }
}


// ═══════════════════════════════════════════════════════════════
//  Analysis
// ═══════════════════════════════════════════════════════════════

export async function startAnalysis(datasetId) {
  const res = await api.post("/api/v1/analysis/start", {
    dataset_id: datasetId,
  });
  return res.data; // { analysis_id, celery_task_id, message }
}

export async function getAnalysis(analysisId) {
  const res = await api.get(`/api/v1/analysis/${analysisId}`);
  return res.data;
}

export async function getAnalysisStatus(analysisId) {
  const res = await api.get(`/api/v1/analysis/${analysisId}/status`);
  return res.data;
}

export async function getAnalysisHistory() {
  const res = await api.get("/api/v1/analysis");
  return res.data;
}

export async function deleteAnalysis(analysisId) {
  const res = await api.delete(`/api/v1/analysis/${analysisId}`);
  return res.data;
}

export async function exportAnalysis(analysisId) {
  const res = await api.get(`/api/v1/analysis/${analysisId}/export`);
  return res.data; // { suspicious_accounts, fraud_rings, summary }
}


// ═══════════════════════════════════════════════════════════════
//  Network / Isomorphism
// ═══════════════════════════════════════════════════════════════

export async function startIsomorphismSearch(analysisId, targetNode, hops) {
  const res = await api.post("/api/v1/network/isomorphism", {
    analysis_id: analysisId,
    target_node: targetNode,
    hops,
  });
  return res.data; // { celery_task_id, message }
}

export async function getGraphData(analysisId) {
  const res = await api.get(`/api/v1/network/graph/${analysisId}`);
  return res.data; // { graph, risk, stats }
}


// ═══════════════════════════════════════════════════════════════
//  Task Polling
// ═══════════════════════════════════════════════════════════════

export async function getTaskStatus(taskId) {
  const res = await api.get(`/api/v1/tasks/${taskId}`);
  return res.data; // { task_id, status, result, error }
}

/**
 * Poll a Celery task until it resolves (SUCCESS or FAILURE).
 * Returns the final task status response.
 */
export function pollTask(taskId, intervalMs = 1500) {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await getTaskStatus(taskId);

        if (status.status === "SUCCESS") {
          resolve(status);
        } else if (status.status === "FAILURE") {
          reject(new Error(status.error || "Task failed"));
        } else {
          setTimeout(poll, intervalMs);
        }
      } catch (err) {
        reject(err);
      }
    };
    poll();
  });
}

export default api;
