// TODO: only for development. will use ENV variables in deploy env.
if (process.env.NODE_ENV == "development") {
  module.exports = {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: "test_user",
      password: "12345678",
      database: "test_database",
      charset: "utf8"
    }
  };
} else {
  module.exports = {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: process.env.JXJ_USER_NAME,
      password: process.env.JXJ_PASSWORD,
      database: process.env.JXJ_DATABASE,
      charset: "utf8"
    }
  };
}
