import Event from "../../structures/Event";
import { Interaction } from "discord.js";
import { developers } from "../../Config";
import { bulbfetch } from "src/utils/BulbBotFetch";

export default class extends Event {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args, {
      once: true,
    });
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.isSelectMenu()) {
      if (interaction.customId === "infraction")
        await infraction(this.client, interaction);
      else if (interaction.customId === "reminders")
        await reminders(this.client, interaction);
    } else if (interaction.isContextMenu()) {
      const member = await this.client.bulbfetch.getGuildMember(
        interaction.guild?.members,
        interaction.targetId
      );
      if (!interaction.guildId || !member) return;

      if (
        await this.client.bulbutils.resolveUserHandle(
          interaction,
          await this.client.bulbutils.checkUser(interaction, member),
          member.user
        )
      )
        return;

      const command = this.client.commands.get(interaction.commandName);

      await command?.run(interaction);
    } else if (interaction.isCommand()) {
      const guild =
        interaction.guild ||
        (await bulbfetch(this.client.guilds, interaction.guildId));
      if (!guild) {
        // Shouldn't be possible, or API error. Would mean command was sent in guild that doesn't exist (or API error)
        return;
      }

      // Slash commands
      const command = this.client.commands.get(interaction.commandName);

      if (!command) {
        // Shouldn't be possible because we shouldn't register commands that we aren't prepared
        // to handle, but we need to narrow the type properly regardless. It is technically plausible
        return;
      }

      if (interaction.options.getSubcommand(false)) {
        const subCommand = command.subCommands.find(
          (subCommand) =>
            subCommand.name === interaction.options.getSubcommand(false)
        );

        if (subCommand) return subCommand.run(interaction);
      }

      const missing = command.validateClientPermissions(interaction);

      if (command.devOnly && !developers.includes(interaction.user.id))
        return interaction.reply({
          content: "This maze was not meant for you",
          ephemeral: true,
        });

      if (missing)
        return interaction.reply({
          content: `The bot is missing crucial permissions to perform this command. Please check the bot's permissions.\n**Missing permissions:** \`${missing}\``,
          ephemeral: true,
        });

      // Should we add a .catch to handle uncaught errors thrown in command run methods?
      await command.run(interaction);
    }
  }
}
