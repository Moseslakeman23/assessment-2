# Sports Management API Query Examples

## Basic Queries

### Get all teams with basic info
```graphql
query GetTeams {
  teams {
    id
    name
    city
    foundedYear
  }
}
```

### Get team details with players
```graphql
query GetTeamDetails($teamId: ID!) {
  team(id: $teamId) {
    name
    coach
    players {
      name
      position
    }
    statistics {
      wins
      losses
      goalsFor
    }
  }
}
```

## Advanced Queries

### Filter matches by status
```graphql
query GetMatches($status: MatchStatus) {
  matches(status: $status) {
    date
    location
    homeTeam {
      name
    }
    awayTeam {
      name
    }
    status
  }
}
```

### Get player statistics
```graphql
query GetPlayerStats($playerId: ID!) {
  player(id: $playerId) {
    name
    team {
      name
    }
    statistics {
      goals
      assists
      matchesPlayed
    }
  }
}
```

## Mutations

### Create a new team
```graphql
mutation CreateTeam($input: TeamInput!) {
  createTeam(input: $input) {
    id
    name
    city
  }
}
```

### Schedule a match
```graphql
mutation ScheduleMatch($input: MatchInput!) {
  scheduleMatch(input: $input) {
    id
    date
    homeTeam {
      name
    }
    awayTeam {
      name
    }
  }
}
```

### Update match score
```graphql
mutation UpdateScore($matchId: ID!, $scoreInput: ScoreInput!) {
  updateMatchScore(id: $matchId, input: $scoreInput) {
    score {
      home
      away
    }
  }
}
```

## Error Handling
See [ERROR_CODES.md](ERROR_CODES.md) for complete error reference

## Testing Instructions
1. Start the server: `npm run dev`
2. Open GraphQL Playground at http://localhost:4000
3. Paste queries into left panel and click play
4. For mutations, use variables panel to provide input values
## Transfer Player Example

```graphql
mutation {
  transferPlayer(
    playerId: "1"
    fromTeamId: "1"
    toTeamId: "2"
    transferFee: 5000000
  ) {
    player {
      id
      name
      team {
        id
        name
      }
    }
    fromTeam {
      id
      name
      marketValue
    }
    toTeam {
      id
      name
      marketValue
    }
    transferFee
    transferDate
  }
}
```

## Expected Response
```json
{
  "data": {
    "transferPlayer": {
      "player": {
        "id": "1",
        "name": "Alex Morgan",
        "team": {
          "id": "2",
          "name": "Tigers"
        }
      },
      "fromTeam": {
        "id": "1",
        "name": "Lions",
        "marketValue": 10000000
      },
      "toTeam": {
        "id": "2",
        "name": "Tigers",
        "marketValue": 15000000
      },
      "transferFee": 5000000,
      "transferDate": "2025-06-26T01:36:09.000Z"
    }
  }
}
```