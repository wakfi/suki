import ApplicationCommand from "../../structures/ApplicationCommand";
import { ApplicationCommandType } from "discord-api-types/v10";
import BulbBotClient from "../../structures/BulbBotClient";

export default class Birthday extends ApplicationCommand {
  constructor(client: BulbBotClient, name: string) {
    super(client, {
      name,
      description: "View and manage your saved birthday settings",
      dmPermission: true,
      type: ApplicationCommandType.ChatInput,
    });
  }
}
