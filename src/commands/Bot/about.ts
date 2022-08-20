import {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  CommandInteraction,
} from "discord.js";
import { botInvite, embedColor, supportInvite } from "../../Config";
import BulbBotClient from "../../structures/BulbBotClient";
import ApplicationCommand from "../../structures/ApplicationCommand";
import { ApplicationCommandType } from "discord-api-types/v9";
import * as packageJson from "package.json";

export default class About extends ApplicationCommand {
  constructor(client: BulbBotClient, name: string) {
    super(client, {
      name,
      description: "Returns some useful information about the bot",
      type: ApplicationCommandType.ChatInput,
      clientPermissions: ["EMBED_LINKS"],
    });
  }

  public async run(interaction: CommandInteraction): Promise<void> {
    const realCommitTime: string = this.client.bulbutils.formatDays(
      new Date(this.client.about.build.time.slice(0, -7))
    );
    const latency: number = Math.floor(
      Date.now() - interaction.createdTimestamp
    );
    const apiLatency: number = Math.round(this.client.ws.ping);

    const row = new MessageActionRow().addComponents([
      new MessageButton()
        .setLabel("Invite")
        .setStyle("LINK")
        .setEmoji("🔗")
        .setURL(botInvite),
      new MessageButton()
        .setLabel("Support")
        .setStyle("LINK")
        .setEmoji("❤️")
        .setURL(supportInvite),
      new MessageButton()
        .setLabel("Source Code")
        .setStyle("LINK")
        .setEmoji("💾")
        .setURL("https://github.com/wakfi/suki"),
    ]);

    let desc = [
      `**__Suki Information__**`,
      `**Version:** TS ${packageJson.version}`,
      "",
      "**Last Commit:**",
      `**Hash:** \`${this.client.about.build.hash}\`**Time:** ${realCommitTime}`,
      "",
      `**Ping:** \`${latency} ms\``,
      `**API Latency:** \`${apiLatency} ms\``,
      "",

      `The current uptime is **${this.client.bulbutils.getUptime(
        this.client.uptime
      )}**`,
      "",
      `**Supporters**`,
      "",
    ].join("\n");

    const embed: MessageEmbed = new MessageEmbed()
      .setColor(embedColor)
      .setDescription(desc)
      .setFooter({
        text: `Executed by ${interaction.user.tag}`,
        iconURL: interaction.user.avatarURL({ dynamic: true }) || "",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
