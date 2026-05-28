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

  type Profile {
    id: ID!
    firstName: String!
    lastName: String!
    role: [String!]
    gender: String
    dob: String
    bio: String
    userId: ID!
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
    todos(page: Int): [ToDo!]!
    todo(id: ID!): ToDo
    todosByMe: [ToDo!]!
    myProfile: Profile
    TodosByStatus(status: String!): [ToDo!]!
  }

  type Mutation {
    signup(email: String!): Message
    verifyOtp(email: String!, otp: String!, password: String!): Message
    login(email: String!, password: String!): AuthPayload
    refreshToken(refreshToken: String!): AuthPayload
    logout: Message
    createTodo(name: String!, description: String!): ToDo
    updateProfile(
      firstName: String
      lastName: String
      role: [String!]
      bio: String
      dob: String
      gender: String
    ): Profile
    updateTodo(id: ID!, name: String, description: String, status: String): ToDo
    deleteTodo(id: ID!): Message
  }

  type Message {
    message: String!
  }
`;

export default typeDefs;
