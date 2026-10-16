import { createContext, useContext } from 'react'
export interface AuthContextValue {
  user:{id:number;username:string}|null
  loading:boolean
  login:(username:string,password:string) => Promise<void>
  register:(username:string,password:string) => Promise<void>
  logout:() => void
}
export const AuthContext = createContext<AuthContextValue|null>(null)
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth requires AuthProvider')
  return value
}
