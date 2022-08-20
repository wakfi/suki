import {
  Snowflake,
  ColorResolvable,
  ActivityType,
  PresenceStatusData,
  IntentsString,
  PartialTypes,
  PermissionString,
} from "discord.js";

export const name = "Suki";
export const developers: string[] = [
  "190160914765316096",
  "439396770695479297",
  "193160566334947340",
];
export const subDevelopers: string[] = [];
export const whitelistedGuilds: string[] = [
  "715334930527158314",
  "705002316947783740",
];
export const version = "1.0.0";
export const lib = "Discord.JS";

// Configs
export const embedColor: ColorResolvable = "#FF00FF";
export const intents: IntentsString[] = [
  "GUILDS",
  "GUILD_MEMBERS",
  "GUILD_BANS",
  "GUILD_INVITES",
  "GUILD_MESSAGE_REACTIONS",
  "GUILD_VOICE_STATES",
  "GUILD_SCHEDULED_EVENTS",
];
export const partials: PartialTypes[] = [];
export const defaultPerms: PermissionString[] = [
  "SEND_MESSAGES",
  "VIEW_CHANNEL",
  "EMBED_LINKS",
  "ATTACH_FILES",
  "USE_EXTERNAL_EMOJIS",
];

// pm2 configs
export const pm2Name = "suki";

// Client
export const tag = "Suki#5293";
export const id: Snowflake = "715296976287039508";
export const activityName = "🎂";
export const type: Exclude<ActivityType, "CUSTOM"> = "WATCHING";
export const status: PresenceStatusData = "online";
export const supportInvite = "";
export const botInvite = "";

export const discordApi = "https://discord.com/api/v9";

export default {
  name,
  developers,
  subDevelopers,
  whitelistedGuilds,
  version,
  lib,
  embedColor,
  intents,
  partials,
  defaultPerms,
  pm2Name,
  tag,
  id,
  activityName,
  type,
  status,
  supportInvite,
  botInvite,
  discordApi,
};
