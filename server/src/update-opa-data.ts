const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

export const updateOpaData = async () => {
  const update = await axios.post(
    "http://localhost:7002/data/config",
    {
      id: uuidv4(),
      entries: [
        {
          url: "mysql://root:mysql@example_db:3306/test",
          config: {
            fetcher: "MySQLFetchProvider",
            query: "SELECT name, id, karma, location FROM users;",
            connection_params: {
              host: "example_db",
              port: 3306,
              user: "root",
              db: "test",
              password: "mysql",
            },
          },
          topics: ["mysql"],
          dst_path: "users",
          save_method: "PUT",
        },
        {
          url: "mysql://root:mysql@example_db:3306/test",
          config: {
            fetcher: "MySQLFetchProvider",
            query: "SELECT title, id, location FROM recipes;",
            connection_params: {
              host: "example_db",
              port: 3306,
              user: "root",
              db: "test",
              password: "mysql",
            },
          },
          topics: ["mysql"],
          dst_path: "recipes",
          save_method: "PUT",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log("update triggered");
  return true;
};
