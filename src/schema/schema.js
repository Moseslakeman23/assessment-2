const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Query {
    teams: [Team]
    team(id: String!): Team
    players(teamId: String, position: PlayerPosition): [Player]
    player(id: String!): Player
    matches(teamId: String, status: MatchStatus, dateFrom: String, dateTo: String, limit: Int): [Match]
    match(id: String!): Match
    standings: [TeamStatistics]
    topScorers(limit: Int): [PlayerStatistics]
    africanPlayers: [Player] # New query for African players
  }

  type Mutation {
    transferPlayer(
      playerId: String!,
      fromTeamId: String!,
      toTeamId: String!,
      transferFee: Float!
    ): TransferResult
    addPlayerToTeam(input: AddPlayerToTeamInput!): Player
    createTeam(input: CreateTeamInput!): Team
    updateTeam(id: String!, input: UpdateTeamInput!): Team
    deleteTeam(id: String!): Boolean
    createPlayer(input: CreatePlayerInput!): Player
    updatePlayer(id: String!, input: UpdatePlayerInput!): Player
    deletePlayer(id: String!): Boolean
    scheduleMatch(input: ScheduleMatchInput!): Match
    updateMatchScore(id: String!, input: UpdateMatchScoreInput!): Match
    addMatchEvent(id: String!, input: AddMatchEventInput!): Match
    updateMatchStatus(id: String!, status: MatchStatus!): Match
  }

  type Team {
    id: String!
    name: String!
    city: String!
    foundedYear: Int!
    coach: String!
    squad: [Player]
    players: [Player]
    homeMatches: [Match]
    awayMatches: [Match]
    statistics: TeamStatistics
  }
   
  type TeamStatistics {
    wins: Int
    losses: Int
    draws: Int
    goalsScored: Int
    goalsConceded: Int
  }

  type Player {
    id: String!
    name: String!
    age: Int!
    position: PlayerPosition!
    teamId: String!
    jerseyNumber: Int!
    nationality: String!
    isAfricanPlayer: Boolean!
    team: Team
    statistics: PlayerStatistics
    matches: [Match]
  }

  type Match {
    id: String!
    homeTeamId: String!
    awayTeamId: String!
    date: String!
    location: String!
    status: MatchStatus!
    score: MatchScore
    homeTeam: Team
    awayTeam: Team
    events: [Event]
  }

  type Event {
    id: String!
    matchId: String!
    playerId: String!
    time: String!
    type: EventType!
  }

  enum EventType {
    GOAL
    ASSIST
    YELLOW_CARD
    RED_CARD
    SUBSTITUTION
  }

  type MatchScore {
    home: Int!
    away: Int!
    winner: Team
  }

  type MatchEvent {
    id: String!
    matchId: String!
    type: MatchEventType!
    minute: Int!
    playerId: String
    description: String
    player: Player
  }

  type PlayerStatistics {
    playerId: String!
    matchesPlayed: Int!
    goals: Int!
    assists: Int!
    yellowCards: Int!
    redCards: Int!
    player: Player
  }

  type TeamStatistics {
    teamId: String!
    matchesPlayed: Int!
    wins: Int!
    draws: Int!
    losses: Int!
    goalsFor: Int!
    goalsAgainst: Int!
    team: Team
  }

  enum PlayerPosition {
    FORWARD
    MIDFIELDER
    DEFENDER
    GOALKEEPER
  }

  enum MatchStatus {
    SCHEDULED
    IN_PROGRESS
    COMPLETED
  }

  enum MatchEventType {
    GOAL
    ASSIST
    YELLOW_CARD
    RED_CARD
  }

  input AddPlayerToTeamInput {
    name: String!
    nationality: String!
    age: Int!
    position: PlayerPosition!
    jerseyNumber: Int!
    teamId: String!
    marketValue: Float
  }

  input CreateTeamInput {
    name: String!
    city: String!
    foundedYear: Int!
    coach: String!
  }

  input UpdateTeamInput {
    name: String
    city: String
    foundedYear: Int
    coach: String
  }

  input CreatePlayerInput {
    name: String!
    nationality: String!
    age: Int!
    position: PlayerPosition!
    jerseyNumber: Int!
    teamId: String!
  }

  input UpdatePlayerInput {
    name: String
    nationality: String
    age: Int
    position: PlayerPosition
    jerseyNumber: Int
    teamId: String
  }

  input ScheduleMatchInput {
    homeTeamId: String!
    awayTeamId: String!
    date: String!
    location: String!
  }

  input UpdateMatchScoreInput {
    home: Int!
    away: Int!
  }

  input AddMatchEventInput {
    type: MatchEventType!
    minute: Int!
    playerId: String
    description: String
  }

  type TransferResult {
    player: Player!
    fromTeam: Team!
    toTeam: Team!
    transferFee: Float!
    transferDate: String!
  }
`;

module.exports = typeDefs;
