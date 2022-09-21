const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");

const routes = require("./routes/routes");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: ["https://hanaref-fd006.web.app", "https://hanaref-fd006.firebaseapp.com"] }));

routes(app);

module.exports = app;
