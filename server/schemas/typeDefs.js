const { gql } = require("graphql-tag");

// Define the GraphQL type definitions
const typeDefs = gql`
  type Book {
    authors: [String]
    description: String
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]
  }

  input BookData {
    authors: [String]
    description: String
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(username: String!, email: String!): User
    me: User
    books: [Book]
    book(bookId: String!): Book
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(input: BookData!): User
    removeBook(bookId: String!): User
  }
`;

module.exports = typeDefs;
