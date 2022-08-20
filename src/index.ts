import * as Config from "./Config";
import BulbBotClient from "./structures/BulbBotClient";
import * as env from "dotenv";

env.config({ path: `${__dirname}/../../.env` });

const config = {
  token: process.env.TOKEN,
  defaultPerms: Config.defaultPerms,
};

const client: BulbBotClient = new BulbBotClient(config);

client.login().catch((err: Error) => {
  client.log.error(
    `[CLIENT] Login error: ${err.name} | ${err.message} | ${err.stack}`
  );
});

process.on("exit", () => {
  client.log.info("Process was killed, terminating the client");
  client.destroy();
  client.log.info("Closed everything <3");
});

process.on("unhandledRejection", (err: Error) => {
  client.log.error(
    `[PROGRAM] Unhandled Rejection: ${err.name} | ${err.message} | ${err.stack}`
  );
  client.log.error(err);
});
