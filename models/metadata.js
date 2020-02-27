var mysql = require('mysql2');

var Metadata = {

  getAllCustomMetadata: function (callback) {

    return DBConn.query("SELECT * FROM custom_metadata_fields", callback);

  },
  getAllRequiredMetadata: function (callback) {

    return DBConn.query("SELECT * FROM required_metadata_info", callback);

  },
  getAllRequiredMetadataFields: function (callback) {

    return DBConn.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'required_metadata_info'", callback);

  },

  getAllCustomMetadataFields: function (callback) {

    return DBConn.query("SELECT DISTINCT field_name FROM custom_metadata_fields ORDER BY field_name", callback);

  }
};
module.exports = Metadata;
