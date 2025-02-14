const jwt = require("jsonwebtoken");
const key = process.env.JWT_SECRET;

const setUser = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    key
  );
};
const getUser = async (token) => {
  try {
    return jwt.verify(token, key);
  } catch {
    return null;
  }
};

module.exports = {
  setUser,
  getUser,
};
