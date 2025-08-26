import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    isVerified: Boolean!
  }

  type ToDo {
    id: ID!
    name: String!
    description: String!
    status: String!
    createdBy: User!
    createdAt: String!
  }

  type AuthPayload {
    token: String
    refreshToken: String
    user: User
  }

  type Query {
    # Add at least one field
    hello: String
    me(email: String!): User
    todos: [ToDo!]!
    todo(id: ID!): ToDo
    todosByMe: [ToDo!]!
    TodosByStatus(status: String!): [ToDo!]!
  }

  type Mutation {
    signup(email: String!): Message
    verifyOtp(email: String!, otp: String!, password: String!): Message
    login(email: String!, password: String!): AuthPayload
    refreshToken(refreshToken: String!): AuthPayload
    logout: Message
    createTodo(name: String!, description: String!): ToDo
    updateTodo(id: ID!, name: String, description: String, status: String): ToDo
    deleteTodo(id: ID!): Message
  }

  type Message {
    message: String!
  }
`;

export default typeDefs;
