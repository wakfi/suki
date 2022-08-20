import BulbBotClient from "./BulbBotClient";
import {
  CommandInteraction,
  ContextMenuInteraction,
  Permissions,
  PermissionString,
} from "discord.js";
import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import ApplicationSubCommand from "./ApplicationSubCommand";

interface ApplicationCommandConstructOptions {
  name: string;
  type: ApplicationCommandType | ApplicationCommandOptionType.Subcommand;
  description: string;
  dm_permission?: boolean;
  premium?: boolean;
  subCommands?: ApplicationSubCommandClass[];
  client_permissions?: PermissionString[];
  command_permissions?: PermissionString[];
  options?: (APIApplicationCommandOption & Pick<any, any>)[] | null;
  devOnly?: boolean;
  ownerOnly?: boolean;
}

export type ApplicationSubCommandClass = typeof ApplicationSubCommand;

export default class ApplicationCommand {
  public readonly client: BulbBotClient;
  public readonly type:
    | ApplicationCommandType
    | ApplicationCommandOptionType.Subcommand;
  public readonly name: string;
  public readonly description: string;
  public readonly dm_permission: boolean;
  public readonly default_member_permissions: string | null;
  public readonly premium: boolean;
  public readonly subCommands: ApplicationSubCommand[];
  public readonly command_permissions: PermissionString[];
  public readonly client_permissions: PermissionString[];
  public options: APIApplicationCommandOption[];
  public readonly devOnly: boolean;
  public readonly ownerOnly: boolean;

  constructor(
    client: BulbBotClient,
    {
      type,
      name,
      description,
      dm_permission = false,
      premium = false,
      subCommands = [],
      client_permissions = [],
      command_permissions = [],
      options,
      devOnly = false,
      ownerOnly = false,
    }: ApplicationCommandConstructOptions
  ) {
    this.client = client;
    this.type = type;
    this.name = name;
    this.description = description;
    this.dm_permission = dm_permission;
    this.command_permissions = command_permissions;
    this.premium = premium;
    this.subCommands = subCommands?.map((sc) => new sc(this.client, this));
    this.client_permissions = client_permissions;
    this.default_member_permissions = this.computePermissions();
    // @ts-expect-error
    this.options = options;
    this.devOnly = devOnly;
    this.ownerOnly = ownerOnly;
  }

  public validateClientPermissions(interaction: CommandInteraction): string {
    const missing = this.client_permissions.filter(
      (permission) => !interaction.guild?.me?.permissions.has(permission)
    );
    return missing.join(", ");
  }

  private computePermissions(): string | null {
    const permsBigInt = this.command_permissions.reduce(
      (acc, perm) => acc | Permissions.FLAGS[perm],
      0n
    );
    return permsBigInt !== 0n ? permsBigInt.toString() : null;
  }

  public async run(
    _interaction: CommandInteraction | ContextMenuInteraction
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
