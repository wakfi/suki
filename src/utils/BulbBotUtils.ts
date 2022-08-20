import {
  CommandInteraction,
  ContextMenuInteraction,
  GuildMember,
  Interaction,
  Message,
  ThreadAutoArchiveDuration,
  ThreadChannel,
  User,
} from "discord.js";
import moment, { Duration, Moment } from "moment";
import BulbBotClient from "../structures/BulbBotClient";
import { UserHandle } from "./types/UserHandle";
import { isBaseGuildTextChannel } from "./typechecks";

export type UserObject = Pick<
  User & GuildMember,
  | "tag"
  | "id"
  | "flags"
  | "username"
  | "discriminator"
  | "avatar"
  | "bot"
  | "createdAt"
  | "createdTimestamp"
> &
  Partial<
    Pick<
      User & GuildMember,
      "nickname" | "roles" | "premiumSinceTimestamp" | "joinedTimestamp"
    >
  > & { avatarUrl: ReturnType<(User & GuildMember)["avatarURL"]> };

export default class {
  private readonly client: BulbBotClient;

  constructor(client: BulbBotClient) {
    this.client = client;
  }

  public applicationFlags(flag: number) {
    const flags: string[] = [];
    const GATEWAY_PRESENCE: number = 1 << 12;
    const GATEWAY_PRESENCE_LIMITED: number = 1 << 13;
    const GATEWAY_GUILD_MEMBERS: number = 1 << 14;
    const GATEWAY_GUILD_MEMBERS_LIMITED: number = 1 << 15;
    const VERIFICATION_PENDING_GUILD_LIMIT: number = 1 << 16;
    const EMBEDDED: number = 1 << 17;
    const GATEWAY_MESSAGE_CONTENT: number = 1 << 18;
    const GATEWAY_MESSAGE_CONTENT_LIMITED: number = 1 << 19;
    const SUPPORTS_SLASH_COMMANDS: number = 1 << 23;

    if ((flag & GATEWAY_PRESENCE) == GATEWAY_PRESENCE)
      flags.push("GATEWAY_PRESENCE");
    if ((flag & GATEWAY_PRESENCE_LIMITED) == GATEWAY_PRESENCE_LIMITED)
      flags.push("GATEWAY_PRESENCE_LIMITED");
    if ((flag & GATEWAY_GUILD_MEMBERS) == GATEWAY_GUILD_MEMBERS)
      flags.push("GATEWAY_GUILD_MEMBERS");
    if ((flag & GATEWAY_GUILD_MEMBERS_LIMITED) == GATEWAY_GUILD_MEMBERS_LIMITED)
      flags.push("GATEWAY_GUILD_MEMBERS_LIMITED");
    if (
      (flag & VERIFICATION_PENDING_GUILD_LIMIT) ==
      VERIFICATION_PENDING_GUILD_LIMIT
    )
      flags.push("VERIFICATION_PENDING_GUILD_LIMIT");
    if ((flag & EMBEDDED) == EMBEDDED) flags.push("EMBEDDED");
    if ((flag & GATEWAY_MESSAGE_CONTENT) == GATEWAY_MESSAGE_CONTENT)
      flags.push("GATEWAY_MESSAGE_CONTENT");
    if (
      (flag & GATEWAY_MESSAGE_CONTENT_LIMITED) ==
      GATEWAY_MESSAGE_CONTENT_LIMITED
    )
      flags.push("GATEWAY_MESSAGE_CONTENT_LIMITED");
    if ((flag & SUPPORTS_SLASH_COMMANDS) == SUPPORTS_SLASH_COMMANDS)
      flags.push("SUPPORTS_SLASH_COMMANDS");

    return flags;
  }

  public resolveThreadArchiveDuration(
    duration: Maybe<ThreadAutoArchiveDuration>,
    channel: Maybe<ThreadChannel>
  ): Exclude<ThreadAutoArchiveDuration, "MAX"> {
    if (!duration) {
      // Duration is unavailable for whatever reason, try to fallback to default
      if (isBaseGuildTextChannel(channel))
        return this.resolveThreadArchiveDuration(
          channel.defaultAutoArchiveDuration,
          channel
        );
      // Else fall back to minimum 60 minutes
      return 60; // 60 * 1 hour * 1 day
    }

    // Duration is already a number
    return duration;
  }

  public getUptime(timestamp: number | null) {
    const time: Duration = moment.duration(timestamp, "milliseconds");
    const days: number = Math.floor(time.asDays());
    const hours: number = Math.floor(time.asHours() - days * 24);
    const mins: number = Math.floor(
      time.asMinutes() - days * 24 * 60 - hours * 60
    );
    const secs: number = Math.floor(
      time.asSeconds() - days * 24 * 60 * 60 - hours * 60 * 60 - mins * 60
    );

    let uptime = "";
    if (days > 0) uptime += `${days} day(s), `;
    if (hours > 0) uptime += `${hours} hour(s), `;
    if (mins > 0) uptime += `${mins} minute(s), `;
    if (secs > 0) uptime += `${secs} second(s)`;

    return uptime;
  }

  public async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public formatDays(start: Date) {
    const end: string = moment.utc().format("YYYY-MM-DD");
    const date: Moment = moment(moment.utc(start).format("YYYY-MM-DD"));
    const days: number = moment.duration(date.diff(end)).asDays();

    return `${moment
      .utc(start)
      .format("MMMM, Do YYYY @ hh:mm:ss a")} \`\`(${Math.floor(days)
      .toString()
      .replace("-", "")} day(s) ago)\`\``;
  }

  // Consider deprecating and removing. Should become unused once all commands are migrated
  public userObject(
    isGuildMember: boolean,
    userObject: Maybe<User | GuildMember>
  ) {
    if (!userObject) return;
    let user: UserObject;

    if (isGuildMember && userObject instanceof GuildMember) {
      user = {
        tag: userObject.user.tag,
        id: userObject.user.id,
        flags: userObject.user.flags,
        username: userObject.user.username,
        discriminator: userObject.user.discriminator,
        avatar: userObject.user.avatar,
        avatarUrl: userObject.user.avatarURL({ dynamic: true, size: 4096 }),
        bot: userObject.user.bot,
        createdAt: userObject.user.createdAt,
        createdTimestamp: userObject.user.createdTimestamp,
        nickname: userObject.nickname,

        roles: userObject.roles,
        premiumSinceTimestamp: userObject.premiumSinceTimestamp,
        joinedTimestamp: userObject.joinedTimestamp,
      };
    } else if (userObject instanceof User) {
      user = {
        tag: userObject.tag,
        id: userObject.id,
        flags: userObject.flags,
        username: userObject.username,
        discriminator: userObject.discriminator,
        avatar: userObject.avatar,
        avatarUrl: userObject.avatarURL({ dynamic: true, size: 4096 }),
        bot: userObject.bot,
        createdAt: userObject.createdAt,
        createdTimestamp: userObject.createdTimestamp,
        nickname: null,
      };
    } else {
      return undefined;
    }
    if (user.avatarUrl === null)
      user.avatarUrl = `https://cdn.discordapp.com/embed/avatars/${
        ~~user.discriminator % 5
      }.png`;

    return user;
  }

  async checkUser(
    interaction: Interaction,
    user: GuildMember
  ): Promise<UserHandle> {
    const author = await interaction.guild?.members.fetch(interaction.user.id);

    if (user.id === interaction.user.id) return UserHandle.CANNOT_ACTION_SELF;

    if (interaction.guild?.ownerId === user.id)
      return UserHandle.CANNOT_ACTION_OWNER;

    if (
      interaction.user.id === interaction.guild?.ownerId &&
      interaction.guild.me &&
      interaction.guild.me.roles.highest.id !== user.roles.highest.id &&
      user.roles.highest.rawPosition <
        interaction.guild.me.roles.highest.rawPosition
    )
      return UserHandle.SUCCESS;

    if (author?.roles.highest.id === user.roles.highest.id)
      return UserHandle.CANNOT_ACTION_ROLE_EQUAL;

    if (user.id === this.client.user?.id)
      return UserHandle.CANNOT_ACTION_BOT_SELF;

    if (
      author?.roles &&
      user.roles.highest.rawPosition >= author.roles.highest.rawPosition
    )
      return UserHandle.CANNOT_ACTION_ROLE_HIGHER;

    if (
      interaction.guild?.me &&
      interaction.guild.me.roles.highest.id === user.roles.highest.id
    )
      return UserHandle.CANNOT_ACTION_USER_ROLE_EQUAL_BOT;

    if (
      interaction.guild?.me &&
      user.roles.highest.rawPosition >=
        interaction.guild.me.roles.highest.rawPosition
    )
      return UserHandle.CANNOT_ACTION_USER_ROLE_HIGHER_BOT;

    return UserHandle.SUCCESS;
  }

  async resolveUserHandle(
    interaction: CommandInteraction | ContextMenuInteraction,
    handle: UserHandle,
    user: User
  ): Promise<boolean> {
    switch (handle) {
      case UserHandle.CANNOT_ACTION_SELF:
        await interaction.reply({
          content: "You cannot perform this action on yourself!",
          ephemeral: true,
        });
        return true;

      case UserHandle.CANNOT_ACTION_OWNER:
        await interaction.reply({
          content: "You cannot perform this action on the server owner!",
          ephemeral: true,
        });
        return true;

      case UserHandle.CANNOT_ACTION_BOT_SELF:
        await interaction.reply({
          content: "You cannot perform this action on the bot!",
          ephemeral: true,
        });
        return true;

      case UserHandle.CANNOT_ACTION_ROLE_EQUAL:
      case UserHandle.CANNOT_ACTION_ROLE_HIGHER:
        await interaction.reply({
          content: `You cannot perform this action on **${user.tag}** \`(${user.id})\` as you do not have a higher role than them!`,
          ephemeral: true,
        });
        return true;

      case UserHandle.CANNOT_ACTION_USER_ROLE_EQUAL_BOT:
      case UserHandle.CANNOT_ACTION_USER_ROLE_HIGHER_BOT:
        await interaction.reply({
          content: `I cannot perform this action on **${user.tag}** \`(${user.id})\` as I don't have a higher role than them!`,
          ephemeral: true,
        });
        return true;

      case UserHandle.SUCCESS:
        return false;

      default:
        return false;
    }
  }

  public logError(
    err: Error,
    message?: Message,
    eventName?: string,
    runArgs?: any
  ): void {
    if (process.env.ENVIRONMENT === "dev") throw err;
    console.error(err, message, eventName, runArgs);
  }

  /** Return a list of property keys where the values differ between the two objects */
  public diff<T>(oldObj: T, newObj: T): string[] {
    const diff: string[] = [];
    for (const key of Object.keys(oldObj)) {
      if (!this.objectEquals(oldObj[key], newObj[key])) diff.push(key);
    }
    return diff;
  }

  /** Deep equality check for arrays */
  public arrayEquals<T extends any[]>(
    firstArray: T,
    secondArray: T,
    depth = Infinity
  ) {
    // Allows limiting how deep we drill down to check equality. Passing depth as 1 will
    // only check the first layer of values and not drill into any objects
    if (depth <= 0) return true;
    // If we can pass strict equality then they're equal
    if (firstArray === secondArray) return true;
    if (typeof firstArray !== typeof secondArray) return false;
    // If these are equal, it should be because both are true
    if (firstArray instanceof Array !== secondArray instanceof Array)
      return false;
    // Don't call this function if you can't guarantee at least one of the arguments is an Array
    // if (typeof firstArray !== "object") return firstArray === secondArray;
    // @ts-expect-error
    if ("equals" in firstArray && typeof firstArray.equals === "function")
      // @ts-expect-error
      return firstArray.equals(secondArray);
    if (firstArray.length !== secondArray.length) return false;
    const len = firstArray.length;
    for (let i = 0; i < len; i++) {
      if (firstArray[i] !== secondArray[i]) {
        if (firstArray[i] instanceof Array) {
          if (!this.arrayEquals(firstArray[i], secondArray[i], depth - 1))
            return false;
        } else {
          // This will handle objects as well as things like NaN,
          // which could be both values here as NaN !== NaN
          if (!this.objectEquals(firstArray[i], secondArray[i], depth - 1))
            return false;
        }
      }
    }
    return true;
  }

  /** Deep equality check for objects */
  public objectEquals<T>(firstObject: T, secondObject: T, depth = Infinity) {
    // Allows limiting how deep we drill down to check equality. Passing depth as 1 will
    // only check the first layer of properties and not drill into any objects
    if (depth <= 0) return true;
    // If we can pass strict equality then they're equal
    if (firstObject === secondObject) return true;
    if (typeof firstObject !== typeof secondObject) return false;
    if (typeof firstObject !== "object" || !firstObject || !secondObject) {
      if (typeof firstObject === "number") {
        // isNaN will coerce anything to a number, so isNaN({}) is true apparently.
        // NaN !== NaN so they would fail strict equality
        if (isNaN(firstObject)) return isNaN(secondObject as unknown as number);
      }
      return false;
    }
    // ASSERTION: These should be guaranteed known at this point
    // typeof firstObject === "object" && typeof secondObject === "object"
    // firstObject !== null && secondObject !== null

    // @ts-expect-error This allows a .equals function to be provided to customize behavior
    if ("equals" in firstObject && typeof firstObject.equals === "function") {
      // @ts-expect-error
      return firstObject.equals(secondObject);
    }
    for (const propertyName of Object.keys(firstObject)) {
      // Ensure every key in firstObject is in secondObject
      if (!(propertyName in secondObject)) {
        return false;
      }
    }
    for (const propertyName of Object.keys(secondObject)) {
      // Ensure every key in secondObject is in firstObject
      if (!(propertyName in firstObject)) {
        return false;
      }
      // Functions of the same name from the same prototype (i.e. the same function)
      // but on different objects are strictly equal, so they will pass this check
      if (firstObject[propertyName] !== secondObject[propertyName]) {
        // If any property mismatch, we will consider the objects not equal
        if (
          typeof firstObject[propertyName] !== typeof secondObject[propertyName]
        ) {
          return false;
        } else if (
          firstObject[propertyName] instanceof Array &&
          secondObject[propertyName] instanceof Array
        ) {
          if (
            !this.arrayEquals(
              firstObject[propertyName],
              secondObject[propertyName],
              depth - 1
            )
          )
            return false;
        } else if (typeof firstObject[propertyName] === "object") {
          if (
            !this.objectEquals(
              firstObject[propertyName],
              secondObject[propertyName],
              depth - 1
            )
          )
            return false;
        } else {
          if (typeof firstObject[propertyName] === "number") {
            // We know their typeof values match but they fail strict equality,
            // so if either is typeof "number", both must be NaN or else they cannot be equal
            if (isNaN(firstObject[propertyName]))
              return isNaN(secondObject[propertyName]);
          }
          return false;
        }
      }
    }
    return true;
  }
}
