import { execSync } from 'child_process'

try {
  execSync('npx tsc', { cwd: __dirname, stdio: 'inherit' })
  console.log('✅ TypeScript compiled')
} catch {
  console.error('❌ TypeScript compilation failed')
  process.exit(1)
}

import './dist/index'