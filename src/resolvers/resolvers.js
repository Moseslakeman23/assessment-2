const { ApolloError, UserInputError } = require('@apollo/server');
const DataLoader = require('dataloader');

// Mock data - in a real app, this would be your database
const teams = [
  { id: '1', name: 'Lions', city: 'New York', foundedYear: 1990, coach: 'John Smith' },
  { id: '2', name: 'Tigers', city: 'Los Angeles', foundedYear: 1985, coach: 'Mike Johnson' },
  { id: '3', name: 'Bears', city: 'Chicago', foundedYear: 1995, coach: 'Sarah Williams' },
];

const players = [
  { id: '1', name: 'Alex Morgan', age: 28, position: 'FORWARD', teamId: '1', isAfricanPlayer: false },
  { id: '2', name: 'Chris Green', age: 25, position: 'MIDFIELDER', teamId: '1', isAfricanPlayer: false },
  { id: '3', name: 'David Lee', age: 30, position: 'DEFENDER', teamId: '2', isAfricanPlayer: false },
  { id: '4', name: 'Emma Stone', age: 22, position: 'GOALKEEPER', teamId: '2', isAfricanPlayer: false },
  { id: '5', name: 'Frank White', age: 27, position: 'FORWARD', teamId: '3', isAfricanPlayer: false },
  // Adding African players
  { id: '6', name: 'Chidi Okonkwo', age: 24, position: 'MIDFIELDER', teamId: '1', nationality: 'Nigeria', isAfricanPlayer: true },
  { id: '7', name: 'Amina Diallo', age: 29, position: 'DEFENDER', teamId: '2', nationality: 'Ghana', isAfricanPlayer: true },
  { id: '8', name: 'Youssef El-Sayed', age: 22, position: 'GOALKEEPER', teamId: '3', nationality: 'Egypt', isAfricanPlayer: true }
];

const matches = [
  { 
    id: '1', 
    homeTeamId: '1', 
    awayTeamId: '2', 
    date: '2023-05-10', 
    location: 'Madison Square Garden',
    status: 'COMPLETED',
    score: { home: 2, away: 1 }
  },
  { 
    id: '2', 
    homeTeamId: '3', 
    awayTeamId: '1', 
    date: '2023-05-15', 
    location: 'United Center',
    status: 'SCHEDULED'
  },
];

const matchEvents = [
  { id: '1', matchId: '1', type: 'GOAL', minute: 23, playerId: '1', description: 'Free kick' },
  { id: '2', matchId: '1', type: 'GOAL', minute: 45, playerId: '3', description: 'Penalty' },
  { id: '3', matchId: '1', type: 'YELLOW_CARD', minute: 67, playerId: '2' },
];

const playerStats = [
  { playerId: '1', matchesPlayed: 5, goals: 3, assists: 2, yellowCards: 1, redCards: 0 },
  { playerId: '2', matchesPlayed: 5, goals: 1, assists: 4, yellowCards: 2, redCards: 0 },
  { playerId: '3', matchesPlayed: 4, goals: 2, assists: 1, yellowCards: 1, redCards: 0 },
  { playerId: '4', matchesPlayed: 4, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
  { playerId: '5', matchesPlayed: 3, goals: 1, assists: 1, yellowCards: 0, redCards: 1 },
  { playerId: '6', matchesPlayed: 2, goals: 0, assists: 1, yellowCards: 0, redCards: 0 },
  { playerId: '7', matchesPlayed: 3, goals: 1, assists: 0, yellowCards: 1, redCards: 0 },
  { playerId: '8', matchesPlayed: 1, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
];

const teamStats = [
  { teamId: '1', matchesPlayed: 5, wins: 3, draws: 1, losses: 1, goalsFor: 8, goalsAgainst: 4 },
  { teamId: '2', matchesPlayed: 4, wins: 1, draws: 1, losses: 2, goalsFor: 3, goalsAgainst: 5 },
  { teamId: '3', matchesPlayed: 3, wins: 1, draws: 0, losses: 2, goalsFor: 2, goalsAgainst: 4 },
];

// Data loaders for optimization
const teamLoader = new DataLoader(async (teamIds) => {
  return teamIds.map(id => teams.find(team => team.id === id));
});

const playerLoader = new DataLoader(async (playerIds) => {
  return playerIds.map(id => players.find(player => player.id === id));
});

const matchLoader = new DataLoader(async (matchIds) => {
  return matchIds.map(id => matches.find(match => match.id === id));
});

const playerStatsLoader = new DataLoader(async (playerIds) => {
  return playerIds.map(id => playerStats.find(stat => stat.playerId === id) || {
    playerId: id,
    matchesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0
  });
});

const teamStatsLoader = new DataLoader(async (teamIds) => {
  return teamIds.map(id => teamStats.find(stat => stat.teamId === id) || {
    teamId: id,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0
  });
});

const resolvers = {
  Query: {
    teams: () => teams,
    
    team: async (_, { id }) => {
      const team = await teamLoader.load(id);
      if (!team) throw new ApolloError('Team not found', 'NOT_FOUND');
      return team;
    },
    
    players: (_, { teamId, position }) => {
      let result = [...players];
      if (teamId) result = result.filter(p => p.teamId === teamId);
      if (position) result = result.filter(p => p.position === position);
      return result;
    },
    
    player: async (_, { id }) => {
      const player = await playerLoader.load(id);
      if (!player) throw new ApolloError('Player not found', 'NOT_FOUND');
      return player;
    },
    
    matches: (_, { teamId, status, dateFrom, dateTo, limit }) => {
      let result = [...matches];
      
      if (teamId) {
        result = result.filter(m => 
          m.homeTeamId === teamId || m.awayTeamId === teamId
        );
      }
      
      if (status) {
        result = result.filter(m => m.status === status);
      }
      
      if (dateFrom) {
        result = result.filter(m => m.date >= dateFrom);
      }
      
      if (dateTo) {
        result = result.filter(m => m.date <= dateTo);
      }
      
      return result.slice(0, limit);
    },
    
    match: async (_, { id }) => {
      const match = await matchLoader.load(id);
      if (!match) throw new ApolloError('Match not found', 'NOT_FOUND');
      return match;
    },
    
    standings: () => teamStats,
    
    topScorers: (_, { limit }) => {
      return [...playerStats]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, limit);
    },
    
    // New resolver for African players
    africanPlayers: () => players.filter(p => p.isAfricanPlayer)
  },
  
  Mutation: {
    transferPlayer: async (_, { playerId, fromTeamId, toTeamId, transferFee }) => {
      // Validate player exists
      const player = await playerLoader.load(playerId);
      if (!player) throw new ApolloError('Player not found', 'NOT_FOUND');
      
      // Validate teams exist
      const fromTeam = await teamLoader.load(fromTeamId);
      const toTeam = await teamLoader.load(toTeamId);
      if (!fromTeam || !toTeam) throw new ApolloError('Team not found', 'NOT_FOUND');
      
      // Check if player belongs to fromTeam
      if (player.teamId !== fromTeamId) {
        throw new UserInputError('Player is not part of the source team');
      }
      
      // Update player's team
      player.teamId = toTeamId;
      
      // Update team market values
      fromTeam.marketValue -= transferFee;
      toTeam.marketValue += transferFee;
      
      // Return transfer result
      return {
        player,
        fromTeam,
        toTeam,
        transferFee,
        transferDate: new Date().toISOString()
      };
    },
    addPlayerToTeam: async (_, { input }) => {
      const { name, nationality, age, position, jerseyNumber, teamId, marketValue } = input;

      // Validate player details
      if (!name || name.length < 2) {
        throw new UserInputError('Player name must be at least 2 characters');
      }

      if (age < 16 || age > 50) {
        throw new UserInputError('Player age must be between 16 and 50');
      }

      if (!position || !Object.values(PlayerPosition).includes(position)) {
        throw new UserInputError('Invalid player position');
      }

      if (jerseyNumber < 1 || jerseyNumber > 99) {
        throw new UserInputError('Jersey number must be between 1 and 99');
      }

      // Validate team exists
      const team = await teamLoader.load(teamId);
      if (!team) throw new ApolloError('Team not found', 'NOT_FOUND');

      // Check for duplicate player in team
      if (team.squad.some(p => p.id === newPlayer.id)) {
        throw new UserInputError('Player with this ID already exists in the team');
      }

      // Create new player
      const newPlayer = {
        id: String(players.length + 1),
        name,
        nationality,
        age,
        position,
        jerseyNumber,
        teamId,
        marketValue: marketValue || 0,
        isAfricanPlayer: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt'].includes(nationality)
      };

      players.push(newPlayer);

      // Update team squad
      team.squad = [...team.squad, newPlayer];

      return newPlayer;
    },
    createTeam: (_, { input }) => {
      if (!input.name || input.name.length < 3) {
        throw new UserInputError('Team name must be at least 3 characters');
      };
      
      if (input.foundedYear < 1800 || input.foundedYear > new Date().getFullYear()) {
        throw new UserInputError('Invalid founded year');
      }
      
      const newTeam = {
        id: String(teams.length + 1),
        ...input
      };
      
      teams.push(newTeam);
      
      // Initialize team stats
      teamStats.push({
        teamId: newTeam.id,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0
      });
      
      return newTeam;
    },
    
    updateTeam: (_, { id, input }) => {
      const teamIndex = teams.findIndex(t => t.id === id);
      if (teamIndex === -1) throw new ApolloError('Team not found', 'NOT_FOUND');
      
      const updatedTeam = { ...teams[teamIndex], ...input };
      teams[teamIndex] = updatedTeam;
      return updatedTeam;
    },
    
    deleteTeam: (_, { id }) => {
      const teamIndex = teams.findIndex(t => t.id === id);
      if (teamIndex === -1) throw new ApolloError('Team not found', 'NOT_FOUND');
      
      // Check if team has players
      if (players.some(p => p.teamId === id)) {
        throw new UserInputError('Cannot delete team with players');
      }
      
      teams.splice(teamIndex, 1);
      
      // Remove team stats
      const statsIndex = teamStats.findIndex(s => s.teamId === id);
      if (statsIndex !== -1) teamStats.splice(statsIndex, 1);
      
      return true;
    },
    
    createPlayer: (_, { input }) => {
      if (!input.name || input.name.length < 2) {
        throw new UserInputError('Player name must be at least 2 characters');
      }
      
      if (input.age < 16 || input.age > 50) {
        throw new UserInputError('Player age must be between 16 and 50');
      }
      
      if (!teams.some(t => t.id === input.teamId)) {
        throw new UserInputError('Team not found');
      }
      
      const newPlayer = {
        id: String(players.length + 1),
        ...input,
        isAfricanPlayer: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt'].includes(input.nationality)
      };
      
      players.push(newPlayer);
      
      // Initialize player stats
      playerStats.push({
        playerId: newPlayer.id,
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0
      });
      
      return newPlayer;
    },
    
    updatePlayer: (_, { id, input }) => {
      const playerIndex = players.findIndex(p => p.id === id);
      if (playerIndex === -1) throw new ApolloError('Player not found', 'NOT_FOUND');
      
      if (input.teamId && !teams.some(t => t.id === input.teamId)) {
        throw new UserInputError('Team not found');
      }
      
      const updatedPlayer = { ...players[playerIndex], ...input };
      players[playerIndex] = updatedPlayer;
      return updatedPlayer;
    },
    
    deletePlayer: (_, { id }) => {
      const playerIndex = players.findIndex(p => p.id === id);
      if (playerIndex === -1) throw new ApolloError('Player not found', 'NOT_FOUND');
      
      players.splice(playerIndex, 1);
      
      // Remove player stats
      const statsIndex = playerStats.findIndex(s => s.playerId === id);
      if (statsIndex !== -1) playerStats.splice(statsIndex, 1);
      
      return true;
    },
    
    scheduleMatch: (_, { input }) => {
      if (!teams.some(t => t.id === input.homeTeamId)) {
        throw new UserInputError('Home team not found');
      }
      
      if (!teams.some(t => t.id === input.awayTeamId)) {
        throw new UserInputError('Away team not found');
      }
      
      if (input.homeTeamId === input.awayTeamId) {
        throw new UserInputError('A team cannot play against itself');
      }
      
      const newMatch = {
        id: String(matches.length + 1),
        ...input,
        status: 'SCHEDULED'
      };
      
      matches.push(newMatch);
      return newMatch;
    },
    
    updateMatchScore: (_, { id, input }) => {
      const matchIndex = matches.findIndex(m => m.id === id);
      if (matchIndex === -1) throw new ApolloError('Match not found', 'NOT_FOUND');
      
      const match = matches[matchIndex];
      
      if (match.status !== 'IN_PROGRESS' && match.status !== 'COMPLETED') {
        throw new UserInputError('Cannot update score for a match that is not in progress');
      }
      
      const updatedMatch = {
        ...match,
        score: {
          home: input.home,
          away: input.away,
          winner: input.home > input.away 
            ? match.homeTeamId 
            : input.away > input.home 
              ? match.awayTeamId 
              : null
        },
        status: 'COMPLETED'
      };
      
      // Update team statistics
      const homeStats = teamStats.find(s => s.teamId === match.homeTeamId);
      const awayStats = teamStats.find(s => s.teamId === match.awayTeamId);
      
      if (homeStats && awayStats) {
        homeStats.matchesPlayed++;
        awayStats.matchesPlayed++;
        
        homeStats.goalsFor += input.home;
        homeStats.goalsAgainst += input.away;
        
        awayStats.goalsFor += input.away;
        awayStats.goalsAgainst += input.home;
        
        if (input.home > input.away) {
          homeStats.wins++;
          awayStats.losses++;
        } else if (input.away > input.home) {
          awayStats.wins++;
          homeStats.losses++;
        } else {
          homeStats.draws++;
          awayStats.draws++;
        }
      }
      
      matches[matchIndex] = updatedMatch;
      return updatedMatch;
    },
    
    addMatchEvent: (_, { id, input }) => {
      const matchIndex = matches.findIndex(m => m.id === id);
      if (matchIndex === -1) throw new ApolloError('Match not found', 'NOT_FOUND');
      
      const match = matches[matchIndex];
      
      if (match.status !== 'IN_PROGRESS') {
        throw new UserInputError('Can only add events to matches in progress');
      }
      
      if (input.playerId && !players.some(p => p.id === input.playerId)) {
        throw new UserInputError('Player not found');
      }
      
      const newEvent = {
        id: String(matchEvents.length + 1),
        matchId: id,
        ...input
      };
      
      matchEvents.push(newEvent);
      
      // Update player statistics if needed
      if (input.playerId) {
        const playerStat = playerStats.find(s => s.playerId === input.playerId);
        if (playerStat) {
          if (input.type === 'GOAL') playerStat.goals++;
          if (input.type === 'ASSIST') playerStat.assists++;
          if (input.type === 'YELLOW_CARD') playerStat.yellowCards++;
          if (input.type === 'RED_CARD') playerStat.redCards++;
        }
      }
      
      return match;
    },
    
    updateMatchStatus: (_, { id, status }) => {
      const matchIndex = matches.findIndex(m => m.id === id);
      if (matchIndex === -1) throw new ApolloError('Match not found', 'NOT_FOUND');
      
      const updatedMatch = {
        ...matches[matchIndex],
        status
      };
      
      matches[matchIndex] = updatedMatch;
      return updatedMatch;
    }
  },
  
  Team: {
    players: (team) => players.filter(p => p.teamId === team.id),
    
    homeMatches: (team) => matches.filter(m => m.homeTeamId === team.id),
    
    awayMatches: (team) => matches.filter(m => m.awayTeamId === team.id),
    
    statistics: async (team) => {
      const stats = await teamStatsLoader.load(team.id);
      return { ...stats, team };
    }
  },
  
  Player: {
    team: async (player) => {
      return await teamLoader.load(player.teamId);
    },
    
    statistics: async (player) => {
      const stats = await playerStatsLoader.load(player.id);
      return { ...stats, player };
    },
    
    matches: (player) => {
      return matches.filter(m => 
        matchEvents.some(e => 
          e.matchId === m.id && e.playerId === player.id
        )
      );
    }
  },
  
  Match: {
    homeTeam: async (match) => {
      return await teamLoader.load(match.homeTeamId);
    },
    
    awayTeam: async (match) => {
      return await teamLoader.load(match.awayTeamId);
    },
    
    events: (match) => {
      return matchEvents.filter(e => e.matchId === match.id);
    },
    
    score: (match) => {
      if (!match.score) return null;
      
      return {
        ...match.score,
        winner: match.score.winner 
          ? teams.find(t => t.id === match.score.winner)
          : null
      };
    }
  },
  
  MatchScore: {
    winner: (score) => {
      if (!score.winner) return null;
      return teams.find(t => t.id === score.winner);
    }
  },
  
  MatchEvent: {
    player: async (event) => {
      if (!event.playerId) return null;
      return await playerLoader.load(event.playerId);
    }
  },
  
  PlayerStatistics: {
    player: async (stats) => {
      return await playerLoader.load(stats.playerId);
    }
  },
  
  TeamStatistics: {
    team: async (stats) => {
      return await teamLoader.load(stats.teamId);
    }
  }
};

module.exports = resolvers;