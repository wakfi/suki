import BulbBotClient from "../structures/BulbBotClient";
import { discordApi } from "../Config";
import fetch from "node-fetch";
import {
  APIApplicationCommand,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import HTTP from "./types/HTTP";

export async function registerSlashCommands(client: BulbBotClient) {
  const isDev: boolean = process.env.ENVIRONMENT === "dev";

  const data = () => {
    const publicCmds: Omit<
      APIApplicationCommand,
      "id" | "application_id" | "version"
    >[] = [];
    const developerCmds: Omit<
      APIApplicationCommand,
      "id" | "application_id" | "version"
    >[] = [];

    for (const command of client.commands.values()) {
      if (command.subCommands.length) {
        if (!command.options) {
          command.options = [];
        }
        for (const subCommand of command.subCommands) {
          command.options.push({
            name: subCommand.name,
            description: subCommand.description,
            type: ApplicationCommandOptionType.Subcommand,
            // FIXME: There has got to be a better solution than just @ts-expect-error
            // @ts-expect-error
            options: subCommand.options,
          });
        }
      }

      const cmd = {
        name: command.name,
        type: command.type as ApplicationCommandType,
        description: command.description,
        default_member_permissions: command.defaultMemberPermissions,
        dm_permission: command.dmPermission,
        options: command.options,
      };

      command.devOnly ? developerCmds.push(cmd) : publicCmds.push(cmd);
    }

    return { publicCmds, developerCmds };
  };

  const { publicCmds, developerCmds } = data();
  if (!process.env.DEVELOPER_GUILD)
    throw new Error(
      "missing process.env.DEVELOPER_GUILD, add that to the .env file"
    );

  const response = await fetch(
    `${discordApi}/applications/${client.user?.id}/${
      isDev ? `guilds/${process.env.DEVELOPER_GUILD}/` : ""
    }commands`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.TOKEN}`,
      },
      method: HTTP.PUT,
      body: JSON.stringify(
        isDev ? [...publicCmds, ...developerCmds] : publicCmds
      ),
    }
  ).then((res) => res.json() as any);

  if (!isDev)
    await fetch(
      `${discordApi}/applications/${client.user?.id}/guilds/${process.env.DEVELOPER_GUILD}/commands`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${process.env.TOKEN}`,
        },
        method: HTTP.PUT,
        body: JSON.stringify(developerCmds),
      }
    );

  client.log.info(
    `[APPLICATION COMMANDS] Registered all of the slash commands, amount: ${response.length}`
  );
}
