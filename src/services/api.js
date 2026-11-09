/**
 * Petal & Thread - REST API Client
 */

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('petal_thread_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.isFormData
    ? {
        ...(localStorage.getItem('petal_thread_admin_token')
          ? { Authorization: `Bearer ${localStorage.getItem('petal_thread_admin_token')}` }
          : {})
      }
    : {
        ...getAuthHeaders(),
        ...options.headers
      };

  const config = {
    ...options,
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
    me: () => request('/auth/me'),
    logout: () =>
      request('/auth/logout', {
        method: 'POST'
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
