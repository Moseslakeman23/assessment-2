const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./schema/schema');
const resolvers = require('./resolvers/resolvers');

const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({
  schema,
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  playground: true, // Enable GraphQL Playground
  introspection: true // Allow schema introspection
});

async function startServer() {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 }
    });
    console.log(`🚀 Sports Management API ready at ${url}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
