/**
 * Centralized API client for LogiTrack frontend.
 * All API calls should go through this base configuration.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
    this.token = localStorage.getItem('logitrack-token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('logitrack-token', token);
    } else {
      localStorage.removeItem('logitrack-token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('logitrack-token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 — token expired or invalid
    if (response.status === 401) {
      this.setToken(null);
      // Don't redirect here — let the AuthContext handle it
    }

    const data = await response.json().catch(() => ({ success: false, message: 'Network error' }));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async googleAuth(credential) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User endpoints
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? '?' + query : ''}`);
  }

  async getUsersByRole(role) {
    return this.request(`/users/role/${role}`);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateProfile(id, profileData) {
    return this.request(`/users/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Shipment endpoints
  async getShipments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/shipments${query ? '?' + query : ''}`);
  }

  async getShipmentById(id) {
    return this.request(`/shipments/${id}`);
  }

  async createShipment(shipmentData) {
    return this.request('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  async updateShipment(id, shipmentData) {
    return this.request(`/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shipmentData),
    });
  }

  async updateShipmentStatus(id, status, note) {
    return this.request(`/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  }

  async deleteShipment(id) {
    return this.request(`/shipments/${id}`, { method: 'DELETE' });
  }

  // Vehicle endpoints
  async getVehicles() {
    return this.request('/vehicles');
  }

  async createVehicle(vehicleData) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(id, vehicleData) {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(id) {
    return this.request(`/vehicles/${id}`, { method: 'DELETE' });
  }

  // Fuel logs
  async getFuelLogs() {
    return this.request('/vehicles/fuellogs');
  }

  async addFuelLog(logData) {
    return this.request('/vehicles/fuellogs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async toggleNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  async clearNotifications() {
    return this.request('/notifications', { method: 'DELETE' });
  }

  // Tickets
  async getTickets() {
    return this.request('/tickets');
  }

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

const apiClient = new ApiClient();
export default apiClient;
