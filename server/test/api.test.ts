// @vitest-environment node
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { Database } from 'better-sqlite3'

const secret = 'integration-test-secret-at-least-32-characters'
let db: Database
let server: Server
let base: string
const token = (userId: number) => jwt.sign({ userId }, secret, { expiresIn: '1h' })

beforeAll(async () => {
  vi.stubEnv('DATABASE_PATH', ':memory:')
  vi.stubEnv('JWT_SECRET', secret)
  const {createDatabase} = await import('../db')
  const {createApp} = await import('../app')
  const {readConfig} = await import('../config')
  db = createDatabase(':memory:')
  const app = createApp(db,readConfig())
  server = createServer(app)
  await new Promise<void>((resolve,reject) => { server.once('error',reject); server.listen(0, '127.0.0.1', resolve) })
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`
})
afterAll(async () => {
  if (server?.listening) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  db?.close()
  vi.unstubAllEnvs()
})
afterEach(() => vi.restoreAllMocks())
beforeEach(() => {
  vi.spyOn(Math,'random').mockReturnValue(0.99)
  db.exec('DELETE FROM leaderboard; DELETE FROM game_history; DELETE FROM games; DELETE FROM users;')
  const insert = db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
  const hash = bcrypt.hashSync('Test-password-123', 4)
  insert.run(1, 'alice', hash)
  insert.run(2, 'bob', hash)
})
async function request(path: string, method = 'GET', body?: unknown, userId = 1) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token(userId)}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: response.status, data: await response.json() as Record<string, any> }
}
function seedGame(userId = 1, overrides: Record<string, unknown> = {}, active = 1) {
  const company = {
    name: 'TestCo', industry: 'AI SaaS', targetUsers: 'Founders', funds: 200000,
    users: 10, revenue: 0, teamMorale: 70, product: 20, marketHeat: 5,
    competition: 10, burnRate: 8, month: 1, maxDecisions: 3, fundraisingCount: 0,
    cooldowns: {}, ...overrides,
  }
  return Number(db.prepare('INSERT INTO games (user_id,company_name,industry,state,is_active) VALUES (?, ?, ?, ?, ?)')
    .run(userId, company.name, company.industry, JSON.stringify({company, history:[company], turn:1, revision:0}), active).lastInsertRowid)
}
function snapshot(id: number) {
  return JSON.parse((db.prepare('SELECT state FROM games WHERE id = ?').get(id) as {state:string}).state)
}

describe('Authoritative game API', () => {
  it('creates canonical starting values and rejects forged initial state', async () => {
    const response = await request('/games', 'POST', {companyName:'Fieldwork',industry:'ai-saas',targetUsers:'Founders',state:{company:{funds:999999}}})
    expect(response.status).toBe(201)
    expect(response.data.state.company.funds).toBe(200000)
    expect(response.data.state.company.product).toBe(20)
  })
  it('rejects arbitrary state replacement', async () => {
    const id = seedGame()
    const state = snapshot(id)
    state.company.funds = 999999
    expect((await request(`/games/${id}`, 'PUT', {state})).status).toBe(405)
    expect(snapshot(id).company.funds).toBe(200000)
  })
  it('does not expose another user’s history', async () => {
    const id = seedGame(2)
    db.prepare('INSERT INTO game_history(game_id,month,state_snapshot) VALUES (?,?,?)').run(id,1,'{"private":true}')
    expect((await request(`/games/${id}/history`)).status).toBe(404)
  })
  it('limits cleanup to the current user and deletes ranked games safely', async () => {
    const own = seedGame(1, {}, 0), other = seedGame(2, {}, 0)
    db.prepare("UPDATE games SET updated_at = datetime('now', '-100 days')").run()
    db.prepare('INSERT INTO leaderboard(user_id,game_id,company_name,score,result,months_played) VALUES(?,?,?,?,?,?)').run(1,own,'TestCo',10,'fail',1)
    expect((await request('/storage/cleanup', 'POST')).status).toBe(200)
    expect(db.prepare('SELECT id FROM games WHERE id=?').get(own)).toBeUndefined()
    expect(db.prepare('SELECT id FROM games WHERE id=?').get(other)).toBeDefined()
  })
  it('deletes all user data transactionally even with leaderboard references', async () => {
    const id = seedGame()
    const other = seedGame(2)
    db.prepare('INSERT INTO leaderboard(user_id,game_id,company_name,score,result,months_played) VALUES(?,?,?,?,?,?)').run(1,id,'TestCo',10,'fail',1)
    expect((await request('/games/user/all','DELETE')).status).toBe(200)
    expect(db.prepare('SELECT id FROM games WHERE id=?').get(id)).toBeUndefined()
    expect(db.prepare('SELECT id FROM games WHERE id=?').get(other)).toBeDefined()
  })
  it('does not accept client-declared victories', async () => {
    const id = seedGame()
    expect((await request('/leaderboard','POST',{gameId:id,result:'success'})).status).toBe(405)
    expect(db.prepare('SELECT COUNT(*) AS count FROM leaderboard').get()).toEqual({count:0})
  })
  it('rejects stale turns and never processes an inactive game', async () => {
    const id = seedGame()
    const first = await request(`/games/${id}/turn`,'POST',{decisions:[{id:'product-dev'}],revision:0})
    expect(first.status).toBe(200)
    const second = await request(`/games/${id}/turn`,'POST',{decisions:[{id:'product-dev'}],revision:0})
    expect(second.status).toBe(409)
    expect(snapshot(id).company.month).toBe(2)
    db.prepare('UPDATE games SET is_active=0 WHERE id=?').run(id)
    expect((await request(`/games/${id}/purchase`,'POST',{type:'tech',id:'mvp',revision:1})).status).toBe(409)
  })
  it('persists terminal state and scores exactly once', async () => {
    const id = seedGame(1,{funds:100, month:5})
    expect((await request(`/games/${id}/turn`,'POST',{decisions:[{id:'product-dev'}],revision:0})).status).toBe(200)
    expect(snapshot(id).endCondition.type).toBe('fail')
    expect((await request(`/games/${id}`)).data.is_active).toBe(0)
    expect((await request(`/games/${id}/turn`,'POST',{decisions:[{id:'product-dev'}],revision:1})).status).toBe(409)
    expect((db.prepare('SELECT COUNT(*) AS count FROM leaderboard').get() as {count:number}).count).toBe(1)
  })
  it('persists each turn’s history and prevents forged history writes', async () => {
    const id = seedGame()
    await request(`/games/${id}/turn`,'POST',{decisions:[{id:'product-dev'}],revision:0})
    expect((await request(`/games/${id}/history`)).data).toHaveLength(1)
    expect((await request(`/games/${id}/history`,'POST',{month:99,stateSnapshot:{funds:999999}})).status).toBe(405)
  })
  it('validates IPO eligibility on the server', async () => {
    const id = seedGame()
    expect((await request(`/games/${id}/exit`,'POST',{type:'ipo',revision:0})).status).toBe(400)
    expect(snapshot(id).company.funds).toBe(200000)
  })
})

describe('Additional isolation and transaction regressions', () => {
  it('rejects mutations and deletion of someone else’s game', async () => {
    const id = seedGame(2)
    expect((await request(`/games/${id}/turn`,'POST',{decisions:[{id:'product-dev'}],revision:0})).status).toBe(404)
    expect((await request(`/games/${id}/purchase`,'POST',{type:'tech',id:'mvp',revision:0})).status).toBe(404)
    expect((await request(`/games/${id}`,'DELETE')).status).toBe(404)
    expect(snapshot(id).company.funds).toBe(200000)
  })
  it('preserves the save on a rejected purchase', async () => {
    const id = seedGame()
    const before = snapshot(id)
    expect((await request(`/games/${id}/purchase`,'POST',{type:'tech',id:'mobile-app',revision:0})).status).toBe(400)
    expect(snapshot(id)).toEqual(before)
    expect((await request(`/games/${id}/purchase`,'POST',{type:'tech',id:'mvp',revision:0})).status).toBe(200)
    expect((await request(`/games/${id}/purchase`,'POST',{type:'tech',id:'mvp',revision:1})).status).toBe(400)
  })
  it('uses a saved acquisition offer amount and makes replay impossible', async () => {
    const id = seedGame(1,{acquisitionOffers:[{id:'offer-1',company:'Buyer',amount:250000,terms:'Acquisition',month:1}]})
    const response = await request(`/games/${id}/exit`,'POST',{type:'acquisition',offerId:'offer-1',amount:9999999,revision:0})
    expect(response.status).toBe(200)
    expect(snapshot(id).company.funds).toBe(450000)
    expect(snapshot(id).endCondition.type).toBe('success')
    expect((await request(`/games/${id}/exit`,'POST',{type:'acquisition',offerId:'offer-1',revision:1})).status).toBe(409)
    expect((db.prepare('SELECT COUNT(*) AS count FROM leaderboard').get() as {count:number}).count).toBe(1)
  })
  it('rolls back state and score if turn history cannot be saved', async () => {
    const id = seedGame(1,{funds:100})
    const before = snapshot(id)
    const log = vi.spyOn(console,'error').mockImplementation(() => {})
    db.exec("CREATE TEMP TRIGGER reject_history BEFORE INSERT ON game_history BEGIN SELECT RAISE(ABORT,'test failure'); END")
    try {
      expect((await request(`/games/${id}/turn`,'POST',{decisions:[{id:'product-dev'}],revision:0})).status).toBe(500)
      expect(snapshot(id)).toEqual(before)
      expect(db.prepare('SELECT COUNT(*) AS count FROM leaderboard').get()).toEqual({count:0})
    } finally {
      db.exec('DROP TRIGGER reject_history')
      log.mockRestore()
    }
  })
  it('registers, authenticates and rejects malformed registration input', async () => {
    const response = await request('/auth/register','POST',{username:'charlie',password:'Test-password-123'})
    expect(response.status).toBe(201)
    expect(jwt.verify(response.data.token,secret)).toMatchObject({userId:response.data.user.id})
    expect((await request('/auth/register','POST',{username:'charlie',password:'Test-password-123'})).status).toBe(409)
    expect((await request('/auth/register','POST',{username:123,password:123})).status).toBe(400)
    expect((await request('/auth/register','POST',{username:'new-user',password:'😀'.repeat(30)})).status).toBe(400)
    expect((await request('/auth/login','POST',{username:'charlie',password:'Test-password-123'})).status).toBe(200)
    const forged = await fetch(base+'/games',{headers:{Authorization:'Bearer '+jwt.sign({userId:1},'dev-secret')}})
    expect(forged.status).toBe(401)
  })
})
