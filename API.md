# API Endpoints

Base URL: `http://localhost:3001/api`

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

## Games

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/games | List user's games |
| POST | /api/games | Create new game |
| GET | /api/games/:id | Get game state |
| PUT | /api/games/:id | Update game state |
| DELETE | /api/games/:id | Delete game |
| POST | /api/games/:id/history | Save month history |
| GET | /api/games/:id/history | Get game history |
| DELETE | /api/games/user/all | Delete all user data |

## AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/report | Generate monthly report |

## Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/leaderboard | Get top scores |
| POST | /api/leaderboard | Submit score |
| GET | /api/leaderboard/my | Get user's scores |

## Storage

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/storage/stats | Get storage stats |
| POST | /api/storage/cleanup | Cleanup old games |

## Example Requests

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"pass123"}'
```

### Create Game
```bash
curl -X POST http://localhost:3001/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"companyName":"MyStartup","industry":"AI SaaS","state":{...}}'
```

### Get Storage Stats
```bash
curl http://localhost:3001/api/storage/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```