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
  dmPermission?: boolean;
  premium?: boolean;
  subCommands?: ApplicationSubCommandClass[];
  clientPermissions?: PermissionString[];
  commandPermissions?: PermissionString[];
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
  public readonly dmPermission: boolean;
  public readonly defaultMemberPermissions: string | null;
  public readonly premium: boolean;
  public readonly subCommands: ApplicationSubCommand[];
  public readonly commandPermissions: PermissionString[];
  public readonly clientPermissions: PermissionString[];
  public options: APIApplicationCommandOption[];
  public readonly devOnly: boolean;
  public readonly ownerOnly: boolean;

  constructor(
    client: BulbBotClient,
    {
      type,
      name,
      description,
      dmPermission = false,
      premium = false,
      subCommands = [],
      clientPermissions = [],
      commandPermissions = [],
      options,
      devOnly = false,
      ownerOnly = false,
    }: ApplicationCommandConstructOptions
  ) {
    this.client = client;
    this.type = type;
    this.name = name;
    this.description = description;
    this.dmPermission = dmPermission;
    this.commandPermissions = commandPermissions;
    this.premium = premium;
    this.subCommands = subCommands?.map((sc) => new sc(this.client, this));
    this.clientPermissions = clientPermissions;
    this.defaultMemberPermissions = this.computePermissions();
    // @ts-expect-error
    this.options = options;
    this.devOnly = devOnly;
    this.ownerOnly = ownerOnly;
  }

  public validateClientPermissions(interaction: CommandInteraction): string {
    const missing = this.clientPermissions.filter(
      (permission) => !interaction.guild?.me?.permissions.has(permission)
    );
    return missing.join(", ");
  }

  private computePermissions(): string | null {
    const permsBigInt = this.commandPermissions.reduce(
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
