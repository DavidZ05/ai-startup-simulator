import type { CompanyInput, GameRecord, GameSummary, TurnResponse, PurchaseResponse, ExitResponse, StorageStats } from '../types/api'
import type { Decision } from '../types/game'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

class ApiClient {
  setToken(token: string | null) {
    if (token) localStorage.setItem('auth_token',token)
    else localStorage.removeItem('auth_token')
  }
  getToken() { return localStorage.getItem('auth_token') }
  private async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const token = this.getToken()
    let response: Response
    try {
      response = await fetch(`${API_BASE}${path}`, {
        method, headers:{'Content-Type':'application/json',...(token ? {Authorization:`Bearer ${token}`} : {})},
        body:body === undefined ? undefined : JSON.stringify(body),
        signal:AbortSignal.timeout(15000), cache:'no-store',
      })
    } catch {
      throw new ApiError('Unable to reach the server. Reload your company before retrying; the request may already have been applied.',0)
    }
    let data: {error?:string}
    try { data = await response.json() } catch { throw new ApiError('Invalid server response',response.status) }
    if (!response.ok) throw new ApiError(data.error || 'Request failed',response.status)
    return data as T
  }
  private async authenticate(path: string, username: string, password: string) {
    const data = await this.request<{token:string;user:{id:number;username:string}}>(path,'POST',{username,password})
    this.setToken(data.token)
    return data
  }
  register(username: string,password: string) { return this.authenticate('/auth/register',username,password) }
  login(username: string,password: string) { return this.authenticate('/auth/login',username,password) }
  getMe() { return this.request<{id:number;username:string}>('/auth/me') }
  getGames() { return this.request<GameSummary[]>('/games') }
  createGame(input: CompanyInput) { return this.request<GameRecord>('/games','POST',input) }
  getGame(id: number) { return this.request<GameRecord>(`/games/${id}`) }
  processTurn(id: number, decisions: Decision[], revision: number) {
    return this.request<TurnResponse>(`/games/${id}/turn`,'POST',{decisions:decisions.map(item => ({id:item.id})),revision})
  }
  purchase(id: number,type: 'tech'|'market'|'employee',itemId: string,revision: number) {
    return this.request<PurchaseResponse>(`/games/${id}/purchase`,'POST',{type,id:itemId,revision})
  }
  exit(id: number,type: 'ipo'|'acquisition',revision: number,offerId?: string) {
    return this.request<ExitResponse>(`/games/${id}/exit`,'POST',{type,offerId,revision})
  }
  deleteGame(id: number) { return this.request<{success:boolean}>(`/games/${id}`,'DELETE') }
  deleteAllUserData() { return this.request<{success:boolean}>('/games/user/all','DELETE') }
  getStorageStats() { return this.request<StorageStats>('/storage/stats') }
  cleanupStorage() { return this.request<{success:boolean;deleted:number;message:string}>('/storage/cleanup','POST') }
  logout() { this.setToken(null) }
}
export const api = new ApiClient()
