const { getUser } = require("../Services/auth");

const handleAuthentication = () => {
  return async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return next();
    try {
      const user = await getUser(token);
      req.user = user;
    } catch (error) {
      console.error("Error in verifying token:", error);
      req.user = null;
    }
  };
};

const handleAuthorization = () => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).redirect("/login", { error: "Try Logging Again" });
    next();
  };
};

module.exports = { handleAuthentication, handleAuthorization };
