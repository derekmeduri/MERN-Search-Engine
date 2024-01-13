const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

// set token secret and expiration date
const secret = process.env.SECRET;
const expiration = "2h";

module.exports = {
  AuthenicationError: new GraphQLError("Could not authenticate user.", {
    extensions: {
      code: "UNATHENTICATED",
    },
  }),
  authMiddleware: async ({ req }) => {
    // allows token to be sent via  req.body or req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return req;
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (err) {
      console.error("Invalid token");
    }
    // return request object
    console.log("Returned context: ", req);
    return req;
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
