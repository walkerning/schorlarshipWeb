// TODO: only for development. will use ENV variables in deploy env.
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
