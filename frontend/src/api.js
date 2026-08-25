const BASE_URL = import.meta.env.API_BASE_URL || "http://localhost:8000/api";

const api = {
  // Helper to handle response and errors
  async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        // Redirect to login if user gets unauthorized (optional, handles session expiry)
        if (window.location.pathname !== "/" && !window.location.pathname.includes("login")) {
          window.location.reload();
        }
      }
      let errorMsg = "Something went wrong";
      try {
        const errData = await response.json();
        errorMsg = errData.detail || errData.message || errorMsg;
      } catch (e) {
        // ignore parsing errors
      }
      throw new Error(errorMsg);
    }
    
    if (response.status === 24) { // No Content
      return null;
    }
    
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  },

  // Helper to get authorization headers
  getHeaders() {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  // Auth Operations
  async register(email, password, fullName) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    return this.handleResponse(response);
  },

  async login(email, password) {
    // OAuth2PasswordRequestForm expects x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    const data = await this.handleResponse(response);
    if (data && data.access_token) {
      localStorage.setItem("token", data.access_token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  // User Operations
  async getCurrentUser() {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  },

  async updateBudget(monthlyBudget) {
    const response = await fetch(`${BASE_URL}/users/budget`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ monthly_budget: parseFloat(monthlyBudget) }),
    });
    return this.handleResponse(response);
  },

  // Expense Operations
  async getExpenses(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.startDate) queryParams.append("start_date", filters.startDate);
    if (filters.endDate) queryParams.append("end_date", filters.endDate);
    if (filters.sortBy) queryParams.append("sort_by", filters.sortBy);

    const url = `${BASE_URL}/expenses?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  },

  async getSummary() {
    const response = await fetch(`${BASE_URL}/expenses/summary`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  },

  async createExpense(expenseData) {
    const response = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(expenseData),
    });
    return this.handleResponse(response);
  },

  async updateExpense(expenseId, expenseData) {
    const response = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(expenseData),
    });
    return this.handleResponse(response);
  },

  async deleteExpense(expenseId) {
    const response = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    // FastAPI returns 204 status which handleResponse processes as null
    return this.handleResponse(response);
  }
};

export default api;
