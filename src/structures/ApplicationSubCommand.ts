import BulbBotClient from "./BulbBotClient";
import {
  APIApplicationCommandBasicOption,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import ApplicationCommand from "./ApplicationCommand";
import { CommandInteraction } from "discord.js";

interface ApplicationSubCommandConstructOptions {
  description: string;
  options?: (APIApplicationCommandBasicOption & Pick<any, any>)[];
}

export default class ApplicationSubCommand extends ApplicationCommand {
  public readonly parent: ApplicationCommand;

  constructor(
    client: BulbBotClient,
    name: string,
    parent: ApplicationCommand = {} as any,
    options: ApplicationSubCommandConstructOptions = {
      description: parent.description || "no description",
    }
  ) {
    super(client, {
      name,
      type: ApplicationCommandOptionType.Subcommand,
      description: options.description || parent.description,
      options: options.options as APIApplicationCommandBasicOption[],
    });
    this.parent = parent;
  }

  public async run(_interaction: CommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
