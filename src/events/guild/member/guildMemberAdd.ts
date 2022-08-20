import Event from "../../../structures/Event";
import { GuildMember } from "discord.js";
import prisma from "../../../prisma";

export default class GuildMemberAdd extends Event {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args, {
      on: true,
    });
  }

  public async run(member: GuildMember): Promise<void> {
    await prisma.userGuildPivot.create({
      data: {
        user: {
          connect: {
            discordId: member.id,
          },
        },
        guild: {
          connect: {
            discordId: member.guild.id,
          },
        },
      },
    });
  }
}
