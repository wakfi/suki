import BulbBotClient from "../../../structures/BulbBotClient";
import { CommandInteraction, MessageEmbed } from "discord.js";
import ApplicationSubCommand from "../../../structures/ApplicationSubCommand";
import { prisma } from "./../../../prisma";
import { resolveAvatarUrl } from "utils/helpers";

export default class ViewBirthday extends ApplicationSubCommand {
  constructor(client: BulbBotClient, name: string) {
    super(client, name, {} as any, {
      description: "Set your birthday information",
    });
  }

  public async run(interaction: CommandInteraction) {
    const dbUser = await prisma().user.findUnique({
      where: {
        discordId: interaction.user.id,
      },
      include: {
        guilds: true,
      },
    });
    if (!dbUser) {
      await interaction.reply({
        content:
          "I don't have any information saved about you. Use </birthday view:1010700273934671914> to get started",
        ephemeral: true,
      });
      return;
    }
    const embed = new MessageEmbed().setAuthor({
      name: `${dbUser.tag} (${dbUser.id})`,
      iconURL: resolveAvatarUrl(interaction.user),
    });
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}
