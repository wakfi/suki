import Event from "../../structures/Event";
import { Guild } from "discord.js";
import prisma from "@db/prisma";

export default class GuildCreate extends Event {
  constructor(...args: any[]) {
    // @ts-expect-error
    super(...args, {
      on: true,
    });
  }

  public async run(guild: Guild): Promise<void> {
    this.client.log.info(
      `[GUILD] Joined a new guild ${guild.name} (${guild.id})`
    );

    // Fetch all members of new guild
    const members = await guild.members.fetch();
    // Cross reference known members from other guilds
    const knownMembers = await prisma.user.findMany({
      where: {
        discordId: {
          in: members.map(({ id }) => id),
        },
      },
    });
    // Associate known members with new guild. This allows us to use the data they already have in the database.
    // Default behavior is to be disabled until the user enables it manually, creating this assocaition now just
    // allows us to keep track of this information so it is available when the user wants it
    await prisma.guild.create({
      data: {
        discordId: guild.id,
        users: {
          create: knownMembers.map(({ id }) => ({
            user: {
              connect: {
                id,
              },
            },
          })),
        },
      },
    });

    console.log(
      `Joined new guild: **${guild.name}** \`(${guild.id})\` owned by <@${guild.ownerId}> \`(${guild.ownerId})\`\nMembers: **${guild.memberCount}**`
    );
  }
}
