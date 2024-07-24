const { User } = require("../models");
const { Book } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");
const { GraphQLError } = require("graphql");

const resolvers = {
  Query: {
    books: async () => {
      return await Book.find({});
    },
    book: async (_, { bookId }) => {
      return await Book.findByIdAndUpdate(bookId);
    },

    users: async () => {
      return await User.find({}).populate(`savedBooks`);
    },
    user: async (_, { _id, username, email }) => {
      return await User.findOne({ _id, username, email }).populate(
        `savedBooks`
      );
    },
    // async getSingleUser({ user = null, params }, res) {/*...*/}
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (parent, args, context, info) => {
      console.log("Context from me query:", context.user);
      // console.log('Parent Path from me query:', parent);
      // console.log('Args Path from me query:', args);
      // console.log('Info Path from me query:', info);
      // if no user object, throw authentication error
      if (context.user) {
        // initialize variables
        return User.findOne({ _id: context.user._id }).populate(`savedBooks`);
      }
      throw new GraphQLError("Failed to Execute me Query from Resolvers.js");
    },
  },

  Mutation: {
    // async login({ body }, res) { /*...*/ }
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new GraphQLError("Incorrect Password");
      }

      const token = signToken(user);
      return { token, user };
    },

    // async createUser({ body }, res) { /*...*/ }
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    // async saveBook({ user, body }, res) { /*...*/ }
    saveBook: async (_, { input }, context) => {
      // if no user object, throw authentication error
      if (!context.user) throw AuthenticationError;
      return await User.findByIdAndUpdate(
        // find user by id
        context.user._id,
        // push the book to the savedBooks array
        { $addToSet: { savedBooks: input } },
        // new: true returns the updated object
        { new: true, runValidators: true }
      );
    },

    // async deleteBook({ user, params }, res) { /*...*/ }
    // Make it so a logged in user can only remove a skill from their own profile
    removeBook: async (_, { bookId }, context) => {
      // if no user object, throw authentication error
      if (!context.user) throw AuthenticationError;
      return await User.findByIdAndUpdate(
        // find the user by their ID
        context.user._id,
        // remove the book from the savedBooks array
        { $pull: { savedBooks: { bookId } } },
        // new: true returns the updated object
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
