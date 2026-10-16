// @vitest-environment node
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { expect, it, vi } from 'vitest'

it('does not intercept authenticated API requests or cross-origin resources', () => {
  const listeners: Record<string,(event:unknown) => void> = {}
  const fetch = vi.fn().mockResolvedValue(new Response('{}'))
  runInNewContext(readFileSync('public/sw.js','utf8'),{
    self:{location:{origin:'https://game.example'},addEventListener:(type:string,handler:(event:unknown)=>void) => {listeners[type]=handler}},
    URL,Response,fetch,caches:{open:vi.fn().mockResolvedValue({put:vi.fn()}),match:vi.fn()},
  })
  for (const url of ['https://game.example/api/auth/me','https://other.example/image.png']) {
    const respondWith = vi.fn()
    listeners.fetch({request:new Request(url,{headers:{Authorization:'Bearer test'}}),respondWith})
    expect(respondWith).not.toHaveBeenCalled()
  }
})
