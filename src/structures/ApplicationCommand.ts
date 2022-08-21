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
import type ApplicationSubCommand from "./ApplicationSubCommand";
import { loadAndConstruct } from "./Util";
import { resolve } from "path";

interface ApplicationCommandConstructOptions {
  name: string;
  type: ApplicationCommandType | ApplicationCommandOptionType.Subcommand;
  description: string;
  dmPermission?: boolean;
  premium?: boolean;
  clientPermissions?: PermissionString[];
  commandPermissions?: PermissionString[];
  options?: (APIApplicationCommandOption & Pick<any, any>)[] | null;
  devOnly?: boolean;
  ownerOnly?: boolean;
}

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
  public readonly subCommands: ApplicationSubCommand[] = [];
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
    this.clientPermissions = clientPermissions;
    this.defaultMemberPermissions = this.computePermissions();
    // @ts-expect-error
    this.options = options;
    this.devOnly = devOnly;
    this.ownerOnly = ownerOnly;

    const caller = _getCallerFile(2);
    console.log("for:", this.constructor);
    console.log("caller: ", caller);
    console.log("resolved to: ", resolve(caller, ".."));
    if (caller.endsWith("Util.js")) {
      loadAndConstruct<ApplicationSubCommand>({
        client,
        pathspec: `${_getCallerFile().slice(0, -3)}/*.js`,
        // @ts-expect-error item.parent is readonly. We are ignoring that
        onLoad: (item) => (item.parent = this),
        onError: (item) => {
          throw new Error(`Error while loading subcommand "${item.name}"`);
        },
      }).then((loaded) => this.subCommands.push(...loaded));
    }
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

type CallStack = Parameters<
  NonNullable<typeof Error["prepareStackTrace"]>
>["1"];

// Some crazy dark magic
// This function _MUST_ be defined in the file where it is used, it cannot be imported (just doesn't work)
function _getCallerFile(depth = 1) {
  const originalFunc = Error.prepareStackTrace!;

  let callerfile: string = "";
  try {
    const err = new Error();
    let currentfile: string;

    Error.prepareStackTrace = function (err, stack) {
      return stack;
    };

    currentfile = (err.stack as unknown as CallStack)?.shift()?.getFileName()!;

    while (err.stack?.length) {
      callerfile = (err.stack as unknown as CallStack)?.shift()?.getFileName()!;

      if (currentfile !== callerfile) {
        if (!--depth) {
          break;
        }
        currentfile = callerfile;
      }
    }
  } catch (e) {}

  Error.prepareStackTrace = originalFunc;
  console.log(callerfile);
  return callerfile;
}
