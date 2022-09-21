const functions = require("firebase-functions");

const app = require("./app");
const { connectMongoose } = require("./mongoose");

connectMongoose();

exports.expressApi = functions.https.onRequest(app);
