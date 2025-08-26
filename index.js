import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { context } from './utils/context.js';
import typeDefs from './src/schema.js';
import resolvers from './src/resolvers.js';

dotenv.config();

const startServer = async () => {
  const app = express();

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    introspection: true,
  });

  await server.start();
  server.applyMiddleware({ app });

  // MongoDB connection
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    )
  );
};

startServer();
