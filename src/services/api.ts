import type { Company, Decision, MonthResult } from '../types/game'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
  }

  async register(username: string, password: string) {
    const data = await this.request<{ token: string; user: { id: number; username: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    this.setToken(data.token)
    return data
  }

  async login(username: string, password: string) {
    const data = await this.request<{ token: string; user: { id: number; username: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    this.setToken(data.token)
    return data
  }

  async getMe() {
    return this.request<{ id: number; username: string; created_at: string }>('/auth/me')
  }

  async getGames() {
    return this.request<Array<{ id: number; company_name: string; industry: string; is_active: boolean; updated_at: string }>>('/games')
  }

  async createGame(companyName: string, industry: string, state: unknown) {
    return this.request<{ id: number; companyName: string; industry: string }>('/games', {
      method: 'POST',
      body: JSON.stringify({ companyName, industry, state }),
    })
  }

  async getGame(id: number) {
    return this.request<{ id: number; company_name: string; industry: string; state: unknown }>(`/games/${id}`)
  }

  async updateGame(id: number, state: unknown) {
    return this.request<{ success: boolean }>(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ state }),
    })
  }

  /**
   * 服务端权威回合结算：只提交 decision ids（含完整对象也行，
   * 服务端仅读取 id 并从自己的配置重建效果），返回结算后的 MonthResult。
   */
  async processTurn(gameId: number, decisions: Decision[]) {
    return this.request<MonthResult>(`/games/${gameId}/turn`, {
      method: 'POST',
      body: JSON.stringify({ decisions }),
    })
  }

  /**
   * 服务端权威购买结算：科技/市场/雇员统一入口，只提交 type + id。
   */
  async purchase(gameId: number, type: 'tech' | 'market' | 'employee', id: string) {
    return this.request<{ success: boolean; company: Company }>(`/games/${gameId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    })
  }

  async saveGameHistory(gameId: number, month: number, stateSnapshot: unknown, decisions: unknown[], events: unknown[]) {
    return this.request<{ success: boolean }>(`/games/${gameId}/history`, {
      method: 'POST',
      body: JSON.stringify({ month, stateSnapshot, decisions, events }),
    })
  }

  async getGameHistory(gameId: number) {
    return this.request<Array<{ month: number; state_snapshot: unknown; decisions: unknown; events: unknown }>>(`/games/${gameId}/history`)
  }

  async deleteGame(id: number) {
    return this.request<{ success: boolean }>(`/games/${id}`, {
      method: 'DELETE',
    })
  }

  async deleteAllUserData() {
    return this.request<{ success: boolean; message: string }>('/games/user/all', {
      method: 'DELETE',
    })
  }

  async getStorageStats() {
    return this.request<{ games: number; historyEntries: number; database: { tables: Record<string, number>; totalSize: string } }>('/storage/stats')
  }

  async cleanupStorage() {
    return this.request<{ success: boolean; message: string }>('/storage/cleanup', {
      method: 'POST',
    })
  }

  async generateReport(state: unknown, decisions: unknown[], events: unknown[]) {
    return this.request<{ report: string }>('/ai/report', {
      method: 'POST',
      body: JSON.stringify({ state, decisions, events }),
    })
  }

  async getLeaderboard(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return this.request<Array<{ id: number; username: string; company_name: string; score: number; result: string; months_played: number; created_at: string }>>(`/leaderboard${query}`)
  }

  async submitScore(gameId: number, result: 'success' | 'fail') {
    return this.request<{ success: boolean; score: number }>('/leaderboard', {
      method: 'POST',
      body: JSON.stringify({ gameId, result }),
    })
  }

  async getMyScores() {
    return this.request<Array<{ id: number; company_name: string; score: number; result: string; months_played: number; created_at: string }>>('/leaderboard/my')
  }

  logout() {
    this.setToken(null)
  }
}

export const api = new ApiClient()