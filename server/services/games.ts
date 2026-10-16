import type { GameDatabase } from '../db'
import { deleteGame } from '../db'
import { settleTurn, purchase, computeScore } from '../../src/engine/actions'
import { GAME_CONFIG } from '../../src/config/constants'
import { INDUSTRIES } from '../../src/config/decisions'
import { getEndCondition } from '../../src/engine/conditions'
import type { Company, EndCondition } from '../../src/types/game'
import type { CompanyInput, GameSnapshot, GameRecord } from '../../src/types/api'

export class GameError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export class GameService {
  constructor(private db: GameDatabase) {}

  list(userId: number) {
    return this.db.prepare('SELECT id,company_name,industry,is_active,updated_at FROM games WHERE user_id=? ORDER BY updated_at DESC').all(userId)
  }

  create(userId: number, input: CompanyInput): GameRecord {
    const {companyName,industry,targetUsers} = input || {}
    const definition = INDUSTRIES.find(item => item.id === industry || item.name === industry)
    if (typeof companyName !== 'string' || companyName.trim().length < 2 || companyName.trim().length > 30 ||
      typeof targetUsers !== 'string' || targetUsers.trim().length < 2 || targetUsers.trim().length > 50 || !definition) {
      throw new GameError(400,'Provide a company name (2–30 characters), valid industry and target customers (2–50 characters)')
    }
    const company: Company = {
      name:companyName.trim(),industry:definition.name,targetUsers:targetUsers.trim(),
      funds:GAME_CONFIG.INITIAL_FUNDS,users:GAME_CONFIG.INITIAL_USERS,revenue:0,
      teamMorale:GAME_CONFIG.INITIAL_MORALE,product:GAME_CONFIG.INITIAL_PRODUCT,
      marketHeat:GAME_CONFIG.INITIAL_HEAT,competition:GAME_CONFIG.INITIAL_COMPETITION,
      burnRate:GAME_CONFIG.INITIAL_BURN_RATE,month:1,maxDecisions:GAME_CONFIG.MAX_DECISIONS_PER_ROUND,
      fundraisingCount:0,cooldowns:{},
    }
    const state: GameSnapshot = {company,history:[company],turn:1,revision:0,endCondition:null}
    const row = this.db.prepare('INSERT INTO games(user_id,company_name,industry,state) VALUES(?,?,?,?)')
      .run(userId,company.name,company.industry,JSON.stringify(state))
    return this.get(userId,Number(row.lastInsertRowid))
  }

  get(userId: number, id: number): GameRecord {
    const row = this.db.prepare('SELECT id,company_name,industry,state,is_active,updated_at FROM games WHERE id=? AND user_id=?')
      .get(id,userId) as (Omit<GameRecord,'state'> & {state:string}) | undefined
    if (!row) throw new GameError(404,'Game not found')
    try {
      const state = JSON.parse(row.state) as GameSnapshot
      if (!state.company || !Array.isArray(state.history)) throw new Error('Invalid snapshot')
      state.revision ??= 0
      state.turn ??= 1
      state.endCondition ??= row.is_active ? null : getEndCondition(state.company) || {type:'fail',reason:'This archived venture has ended.'}
      return {...row,state}
    } catch {
      throw new GameError(500,'Unable to read saved game')
    }
  }

  private active(userId: number, id: number, revision: unknown) {
    const game = this.get(userId,id)
    if (!game.is_active || game.state.endCondition) throw new GameError(409,'This game has ended')
    if (!Number.isSafeInteger(revision) || (revision as number) < 0) throw new GameError(400,'A valid revision is required')
    if (game.state.revision !== revision) throw new GameError(409,'This game changed. Reload it before trying again.')
    return game
  }

  private persist(userId: number, id: number, state: GameSnapshot) {
    this.db.prepare('UPDATE games SET state=?,is_active=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?')
      .run(JSON.stringify(state),state.endCondition ? 0 : 1,id,userId)
    if (state.endCondition) {
      this.db.prepare(`INSERT INTO leaderboard(user_id,game_id,company_name,score,result,months_played)
        SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM leaderboard WHERE game_id=?)`)
        .run(userId,id,state.company.name,computeScore(state.company,state.endCondition.type),state.endCondition.type,state.company.month,id)
    }
  }

  turn(userId: number, id: number, revision: unknown, decisions: unknown) {
    return this.db.transaction(() => {
      const game = this.active(userId,id,revision)
      const settled = settleTurn(game.state,decisions)
      if (!settled.ok) throw new GameError(400,settled.error)
      const snapshot: GameSnapshot = {
        ...game.state, company:settled.result.state,history:[...game.state.history,settled.result.state],
        turn:game.state.turn+1,revision:game.state.revision+1,endCondition:settled.result.endCondition,
      }
      this.persist(userId,id,snapshot)
      this.db.prepare('INSERT INTO game_history(game_id,month,state_snapshot,decisions,events) VALUES(?,?,?,?,?)')
        .run(id,game.state.company.month,JSON.stringify(snapshot.company),JSON.stringify(decisions),JSON.stringify(settled.result.events))
      return {...settled.result,snapshot}
    }).immediate()
  }

  purchase(userId: number, id: number, revision: unknown, kind: unknown, itemId: unknown) {
    return this.db.transaction(() => {
      const game = this.active(userId,id,revision)
      const result = purchase(game.state,kind,itemId)
      if (!result.ok) throw new GameError(400,result.error)
      const snapshot: GameSnapshot = {...game.state,company:result.company,revision:game.state.revision+1,endCondition:getEndCondition(result.company)}
      this.persist(userId,id,snapshot)
      return {success:true,company:result.company,snapshot}
    }).immediate()
  }

  exit(userId: number, id: number, revision: unknown, type: unknown, offerId: unknown) {
    return this.db.transaction(() => {
      const game = this.active(userId,id,revision)
      let company = {...game.state.company}
      let endCondition: EndCondition
      if (type === 'ipo') {
        if (company.month < 24 || company.product < 70 || company.users < 100 || company.funds < 300000) {
          throw new GameError(400,'IPO requirements not met')
        }
        company.ipoReady = true
        endCondition = {type:'success',reason:'IPO successful! Your startup is now publicly traded!'}
      } else if (type === 'acquisition') {
        const offer = company.acquisitionOffers?.find(item => item.id === offerId)
        if (!offer) throw new GameError(400,'Acquisition offer not found')
        company = {...company,funds:company.funds+offer.amount}
        endCondition = {type:'success',reason:`Acquired by ${offer.company} for $${offer.amount.toLocaleString()}!`}
      } else throw new GameError(400,'Invalid exit type')
      const snapshot: GameSnapshot = {...game.state,company,revision:game.state.revision+1,endCondition}
      this.persist(userId,id,snapshot)
      return {success:true,snapshot}
    }).immediate()
  }

  history(userId: number, id: number) {
    this.get(userId,id)
    const rows = this.db.prepare('SELECT month,state_snapshot,decisions,events FROM game_history WHERE game_id=? ORDER BY month,id').all(id) as
      Array<{month:number;state_snapshot:string;decisions:string|null;events:string|null}>
    return rows.map(row => ({...row,state_snapshot:JSON.parse(row.state_snapshot),decisions:JSON.parse(row.decisions || '[]'),events:JSON.parse(row.events || '[]')}))
  }

  delete(userId: number, id: number) {
    if (!deleteGame(this.db,userId,id)) throw new GameError(404,'Game not found')
  }
}
