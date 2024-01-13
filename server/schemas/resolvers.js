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

    me: async (parent, args, context, info) => {
      console.log("Context from me query:", context.user);
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate(`savedBooks`);
      }
      throw new GraphQLError("Failed to Execute");
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw AuthenticationError;
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new GraphQLError("Incorrect Login Credentials");
      }
      const token = signToken(user);
      return { token, user };
    },
  },

  addUser: async (_, { username, email, password }) => {
    const user = await User.create({ username, email, password });
    const token = signToken(user);
    return { token, user };
  },

  saveBook: async (_, { input }, context) => {
    if (!context.user) throw AuthenticationError;
    return await User.findByIdAndUpdate(
      context.user._id,
      { $addToSet: { savedBooks: input } },
      { new: true, runValidators: true }
    );
  },
  // only logged in users can remove boook from their profile
  removeBook: async (_, { bookId }, context) => {
    if (!context.user) throw AuthenticationError;
    return await User.findByIdAndUpdate(
      context.user._id,
      { $pull: { savedBooks: { bookId } } },
      { new: true }
    );
  },
};

module.exports = resolvers;
