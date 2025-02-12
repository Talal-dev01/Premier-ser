require("dotenv").config();
const express = require("express");
const path = require("path");
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const { WebflowClient } = require("webflow-api");
const accessToken = process.env.WEBFLOW_ACCESS_TOKEN;
const Props = require("./Models/properties");
const config = require("../Server/config");
const UserSaved = require("./Models/userSaved");
const { v4: uuidv4 } = require("uuid");
const { json } = require("stream/consumers");
const userId = process.env.USER_ID;
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { default: mongoose } = require("mongoose");
const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://figma-to-webflow-92b852.webflow.io"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  // Other security options
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Compression for better performance
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 100 * 1000 // Only compress responses > 100kb
}));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Only log errors
  }));
} else {
  app.use(morgan('dev')); // More concise logging for development
}

// Rate limiting for additional security
app.set('trust proxy', 1); // Add this line before rate limit

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true // Add this
});

app.use('/api/', limiter);
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
config();
// CORS Configuration
const corsOptions = {
  origin: [
    "https://figma-to-webflow-92b852.webflow.io",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));


//*********************************************************** CODE FOR WEBFLOW ************************************************************

// const webflow = new WebflowClient({ accessToken });

// let collectionId;

// const fetchSites = async () => {
//   try {
//     const { sites } = await webflow.sites.list();
//     const site = await webflow.sites.get(sites[0].id);
//     const { collections } = await webflow.collections.list(site.id);
//     collectionId = collections[0].id;
//     const { items } = await webflow.collections.items.listItems(
//       collections[0].id
//     );
//     // console.log(items);
//     await Props.insertMany(items);
//     // return items;
//   } catch (error) {
//     console.error("Error fetching sites:", error);
//     return [];
//   }
// };

// fetchSites();

//*********************************************************** ^ CODE FOR WEBFLOW ^ ************************************************************

//*********************************************************** CODE FOR FETCHING ITEMS ************************************************************


const fetchItem = async (cmsIDs) => {
  try {
    // Use Promise.all with map instead of forEach
    const items = await Promise.all(
      cmsIDs.map(async (id) => {
        const item = await Props.findOne({ id: id });
        return item;
      })
    );
    return items.filter((item) => item !== null);
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};
// Add this near your other routes
app.get("/api/dashboard", async (req, res) => {
  try {
    console.log('Dashboard API called');
    
    // Test MongoDB connection
    if (!mongoose.connection.readyState) {
      console.error('MongoDB not connected');
      return res.status(500).json({ error: 'Database connection error' });
    }

    const userId = process.env.USER_ID;
    console.log('Using USER_ID:', userId);

    const savedItems = await UserSaved.findOne({ userId });
    console.log('Found saved items:', savedItems);

    if (!savedItems) {
      return res.json([]); // Return empty array if no items found
    }

    const properties = await Props.find({ 
      id: { $in: savedItems.cmsId } 
    });
    console.log('Found properties:', properties);

    res.json(properties);
    
  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

app.post("/api/save-card", async (req, res) => {
  try {
    const { slug } = req.body;
    const item = await Props.findOne({ "fieldData.slug": slug });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Check if this specific cmsID already exists in any user's saved items
    const existingSaveWithItem = await UserSaved.findOne({
      userId: userId,
      cmsId: { $in: [item.id] },
    });

    if (existingSaveWithItem) {
      return res.status(400).json({
        success: false,
        message: "Item already saved",
        saved: true,
      });
    }
    // Look for any existing saved items for this user
    const existingUser = await UserSaved.findOne({ userId });

    if (existingUser) {
      await UserSaved.findByIdAndUpdate(
        existingUser._id,
        {
          $addToSet: { cmsId: item.id }, // Use $addToSet to prevent duplicates
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Item added to your saved collection",
        saved: true,
        userId,
      });
    }

    // If no existing user, create new record
    await UserSaved.create({
      cmsId: [item.cmsID],
      userId: userId,
    });

    res.status(200).json({
      success: true,
      message: "Item saved successfully",
      saved: true,
      userId,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

app.delete("/api/delete-saved-item", async (req, res) => {
  try {
    const { cmsId } = req.body;

    // Remove cmsId from user's saved items
    await UserSaved.updateOne(
      { userId }, // Assuming userId is available
      { $pull: { cmsId: cmsId } }
    );

    // Get updated user data
    const user = await UserSaved.findOne({ userId });
    // Fetch updated items
    const updatedItems = await fetchItem(user.cmsId);

    // Send success response with updated items
    res.json({
      success: true,
      items: updatedItems,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
