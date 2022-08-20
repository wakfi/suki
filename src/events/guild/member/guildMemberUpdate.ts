import Event from "../../../structures/Event";
import { GuildMember } from "discord.js";
import { tryIgnore } from "../../../utils/helpers";
import prisma from "../../../prisma";

export default class extends Event {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args, {
      on: true,
    });
  }

  public async run(oldMember: GuildMember, newMember: GuildMember) {
    if (oldMember.user.tag !== newMember.user.tag) {
      await tryIgnore(() =>
        prisma.user.update({
          data: {
            tag: newMember.user.tag,
          },
          where: {
            discordId: newMember.user.id,
          },
        })
      );
    }
  }
}
