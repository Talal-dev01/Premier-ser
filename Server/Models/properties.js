const mongoose = require("mongoose");

const propertiesSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  fieldData: {
    type: Object,
    required: true,
  },
  cmsLocaleId: {
    type: String,
    required: true,
  },
    lastPublished: {
      type: String,
    },
    lastUpdated: {
      type: String,
    },
    createdOn: {
      type: String,
    },
    isArchived: {
      type: Boolean,
    },
    isDraft: {
      type: Boolean,
    },
});

const Props = mongoose.model("Props", propertiesSchema);

module.exports = Props;
