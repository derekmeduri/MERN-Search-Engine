const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

// set token secret and expiration date
const secret = process.env.SECRET;
const expiration = "2h";

module.exports = {
  AuthenticationError: new GraphQLError("Could not authenticate user.", {
    extensions: {
      code: "UNAUTHENTICATED",
    },
  }),
  authMiddleware: async ({ req }) => {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    // if no token, return the request object as is
    if (!token) {
      return req;
    }

    // if token can be verified, add the decoded user's data to the request so it can be accessed in the resolver
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      console.log("Verify JWT Data: ", data);
      req.user = data;
    } catch (err) {
      console.error("Invalid token");
    }

    // return the request object so it can be passed to the resolver as `context`
    console.log("Returned context: ", req);
    return req;
  },

  signToken: function ({ email, username, _id }) {
    const payload = { email, username, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
