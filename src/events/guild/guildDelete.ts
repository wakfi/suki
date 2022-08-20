import Event from "../../structures/Event";
import { Guild } from "discord.js";
import prisma from "@db/prisma";

export default class GuildDelete extends Event {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args, {
      on: true,
    });
  }

  public async run(guild: Guild): Promise<void> {
    this.client.log.info(`[GUILD] Left a guild ${guild.name} (${guild.id})`);

    prisma.guild.delete({
      where: {
        discordId: guild.id,
      },
    });
    console.log(
      `Left guild: **${guild.name}** \`(${guild.id})\` owned by <@${guild.ownerId}> \`(${guild.ownerId})\`\nMembers: **${guild.memberCount}**`
    );
  }
}
