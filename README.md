# Sports Management API

## Overview
GraphQL API for sports team management with features for managing teams, players, matches, and statistics.

## Setup Instructions
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Run Instructions
- Access GraphQL Playground at: http://localhost:4000
- Available queries:
  - `teams`, `team(id)`, `players`, `player(id)`, `matches`, `match(id)`, `standings`, `topScorers`, `africanPlayers`
- Available mutations:
  - `transferPlayer`, `addPlayerToTeam`, `createTeam`, `updateTeam`, `deleteTeam`, `createPlayer`, `updatePlayer`, `deletePlayer`, `scheduleMatch`, `updateMatchScore`, `addMatchEvent`, `updateMatchStatus`

## Notes
- The error related to missing `src/index.js` may be due to file path issues in the development server configuration
- Project structure:
  - `src/index.js` - Server entry point
  - `src/schema/schema.js` - GraphQL type definitions
  - `src/resolvers/resolvers.js` - GraphQL resolvers