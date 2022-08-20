import { CommandInteraction, MessageEmbed } from "discord.js";
import * as Config from "../../Config";
import BulbBotClient from "../../structures/BulbBotClient";
import ApplicationCommand from "../../structures/ApplicationCommand";
import { ApplicationCommandType } from "discord-api-types/v9";

const FSECS = 1000;
const FMINS = FSECS * 60;
const FHOURS = FMINS * 60;
const FDAYS = FHOURS * 24;

export default class Uptime extends ApplicationCommand {
  constructor(client: BulbBotClient, name: string) {
    super(client, {
      name,
      description: "Shows the bot's uptime.",
      type: ApplicationCommandType.ChatInput,
      clientPermissions: ["EMBED_LINKS"],
    });
  }

  public async run(interaction: CommandInteraction): Promise<void> {
    if (!this.client.uptime) return;
    const time = this.client.uptime;
    const days: number = ~~(time / FDAYS);
    const hours: number = ~~(time / FHOURS - days * (FDAYS / FHOURS));
    const mins: number = ~~(time / FMINS - hours * (FHOURS / FMINS));
    const secs: number = ~~(time / FSECS - mins * (FMINS / FSECS));

    let uptime = "";
    if (days > 0) uptime += `${days} day${days !== 1 ? "s" : ""}, `;
    if (hours > 0) uptime += `${hours} hour${hours !== 1 ? "s" : ""}, `;
    if (mins > 0) uptime += `${mins} minute${mins !== 1 ? "s" : ""}, `;
    if (secs > 0) uptime += `${secs} second${secs !== 1 ? "s" : ""}`;

    const embed = new MessageEmbed()
      .setColor(Config.embedColor)
      .setDescription(`The current uptime is **${uptime}**`)
      .setFooter({
        text: `Executed by ${interaction.user.tag}`,
        iconURL: interaction.user.avatarURL({ dynamic: true }) || "",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
