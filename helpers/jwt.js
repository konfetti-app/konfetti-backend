const jwt = require('jsonwebtoken');

const issueToken = function (user) {
  return new Promise((resolve, reject) => {
    const token = jwt.sign({
      username: user.username,  // jwt configuration
      userId: user._id,
      iat: Math.floor(Date.now() / 1000) - 30 // date back 30 seconds
    },
    process.env.JWT_SECRET || 'shhhhh',
    {
      // expiresIn: '1d', // expire in 1 day
    });
    resolve(token);
  });
};

exports.issueToken = issueToken;
