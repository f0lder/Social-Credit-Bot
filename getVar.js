require("dotenv").config();
const env = { Token: process.env.SOCIAL_TOKEN, MongoL: process.env.URL };
module.exports = env;
