import Event from "../../../structures/Event";
import { GuildMember } from "discord.js";
import prisma from "../../../prisma";

export default class GuildMemberRemove extends Event {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args, {
      on: true,
    });
  }

  public async run(member: GuildMember): Promise<void> {
    await prisma.userGuildPivot.delete({
      where: {
        userId_guildId: {
          userId: member.id,
          guildId: member.guild.id,
        },
      },
    });
    const remainingGuildCount = await prisma.userGuildPivot.count({
      where: {
        userId: member.id,
      },
    });
    if (remainingGuildCount === 0) {
      // If the user is no longer in any of our guilds, delete their data
      await prisma.user.delete({
        where: {
          discordId: member.id,
        },
      });
    }
  }
}
