/**
 * Petal & Thread - REST API Client
 */
import { auth } from '../config/firebase.js';

const API_BASE = '/api';

/**
 * Resolves the active authentication token.
 * Prefers Firebase ID token if a Firebase user is active.
 * If Firebase token retrieval fails for an active user, throws an error (never falls back to legacy admin token).
 * Legacy token is only sent when no Firebase user is active.
 */
async function getAuthToken() {
  if (auth && auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (err) {
      console.error('Failed to retrieve Firebase ID token for active user:', err);
      throw new Error('Authentication token retrieval failed. Please sign in again.');
    }
  }

  // Fall back to legacy admin token only when no Firebase user is active
  return localStorage.getItem('petal_thread_admin_token') || null;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const { authToken, isFormData, ...fetchOptions } = options;
  const token = authToken !== undefined ? authToken : await getAuthToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const headers = isFormData
    ? {
        ...authHeader,
        ...fetchOptions.headers
      }
    : {
        'Content-Type': 'application/json',
        ...authHeader,
        ...fetchOptions.headers
      };

  const config = {
    ...fetchOptions,
    headers
  };

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    login: (identifier, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
    me: (legacyTokenOverride) =>
      request('/auth/me', legacyTokenOverride ? { authToken: legacyTokenOverride } : {}),
    logout: () =>
      request('/auth/logout', {
        method: 'POST'
      })
  },

  sellers: {
    register: (data) =>
      request('/sellers/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getMyProfile: () => request('/sellers/me'),
    updateMyProfile: (data) =>
      request('/sellers/me', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    getMyProducts: () => request('/sellers/my-products'),
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/sellers${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/sellers/${id}`),
    updateStatus: (id, status, notes = '') =>
      request(`/sellers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes })
      })
  },

  moderation: {
    getPendingProducts: () => request('/moderation/products'),
    updateProductApproval: (id, approvalStatus, moderationNotes = '') =>
      request(`/moderation/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ approvalStatus, moderationNotes })
      })
  },

  products: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/products${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/products/${id}`),
    create: (data) =>
      request('/products', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) =>
      request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/products/${id}`, {
        method: 'DELETE'
      })
  },

  categories: {
    getAll: () => request('/categories'),
    create: (data) =>
      request('/categories', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) =>
      request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/categories/${id}`, {
        method: 'DELETE'
      })
  },

  fashion: {
    getAll: () => request('/fashion'),
    create: (data) =>
      request('/fashion', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) =>
      request(`/fashion/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/fashion/${id}`, {
        method: 'DELETE'
      })
  },

  artGallery: {
    getAll: () => request('/art-gallery'),
    create: (data) =>
      request('/art-gallery', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) =>
      request(`/art-gallery/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/art-gallery/${id}`, {
        method: 'DELETE'
      })
  },

  orders: {
    getAll: () => request('/orders'),
    getById: (id) => request(`/orders/${id}`),
    create: (data) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateStatus: (id, data) =>
      request(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  enquiries: {
    getAll: () => request('/enquiries'),
    create: (data) =>
      request('/enquiries', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateStatus: (id, data) =>
      request(`/enquiries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/enquiries/${id}`, {
        method: 'DELETE'
      })
  },

  settings: {
    get: () => request('/settings'),
    update: (data) =>
      request('/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  upload: {
    single: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      return request('/upload/single', {
        method: 'POST',
        body: formData,
        isFormData: true
      });
    },
    multiple: async (files) => {
      const formData = new FormData();
      for (const f of files) {
        formData.append('images', f);
      }
      return request('/upload/multiple', {
        method: 'POST',
        body: formData,
        isFormData: true
      });
    }
  }
};
