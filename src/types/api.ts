import type { Company, EndCondition, MonthResult } from './game'

export interface CompanyInput { companyName:string; industry:string; targetUsers:string }
export interface GameSnapshot {
  company:Company
  history:Company[]
  turn:number
  revision:number
  endCondition:EndCondition|null
}
export interface GameSummary {
  id:number; company_name:string; industry:string; is_active:number; updated_at:string
}
export interface GameRecord extends GameSummary { state:GameSnapshot }
export type TurnResponse = MonthResult & {snapshot:GameSnapshot}
export interface PurchaseResponse {success:boolean;company:Company;snapshot:GameSnapshot}
export interface ExitResponse {success:boolean;snapshot:GameSnapshot}
export interface StorageStats {games:number;historyEntries:number;totalSize:string}
