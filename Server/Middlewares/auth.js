const { getUser } = require('../Services/auth');

const handleAuthentication = () => {
  return async (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    try {
      const user = await getUser(token);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid token" 
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication failed" 
      });
    }
  };
};

const handleAuthorization = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization required" 
      });
    }
    next();
  };
};

module.exports = {
  handleAuthentication,
  handleAuthorization
};