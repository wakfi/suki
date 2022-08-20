import { CommandInteraction, MessageEmbed } from "discord.js";
import { embedColor } from "../../Config";
import BulbBotClient from "../../structures/BulbBotClient";
import ApplicationCommand from "../../structures/ApplicationCommand";
import { ApplicationCommandType } from "discord-api-types/v9";

export default class PrivacyPolicy extends ApplicationCommand {
  constructor(client: BulbBotClient, name: string) {
    super(client, {
      name,
      description: "Returns the privacy policy for the bot",
      type: ApplicationCommandType.ChatInput,
      clientPermissions: ["EMBED_LINKS"],
    });
  }

  public async run(interaction: CommandInteraction): Promise<void> {
    const embed: MessageEmbed = new MessageEmbed()
      .setColor(embedColor)
      .setDescription(
        // TODO: Real privacy policy link
        "📜 View the privacy policy of the bot **[here](https://wak.cx/)**"
      )
      .setFooter({
        text: `Executed by ${interaction.user.tag}`,
        iconURL: interaction.user.avatarURL({ dynamic: true }) || "",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
