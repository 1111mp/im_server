import { Optional } from "sequelize";

declare global {
  namespace Electron {
    // Request params types
    namespace Params {
      type FullUpload = {
        platform: Common.Platform;
        version: string;
        archs: Common.Archs;
      };

      type AsarUpload = {
        platform: Common.Platform;
        version: string;
      };

      type InfoForAsar = {
        platform: Common.Platform;
        version: string;
        archs: Common.Archs;
      };
    }

    namespace DB {
      type ElectronAttributes = {
        id: number;
        platform: Electron.Common.Platform;
        version: string;
        actived: boolean;
        archs: Electron.Common.Archs;
        url: string;
        type: Electron.Common.UpdateType;
        forceUpdate: boolean;
        remark: string;
        ext: string;
        createdAt?: Date;
        updatedAt?: Date;
      };

      type ElectronCreationAttributes = Optional<
        ElectronAttributes,
        "id" | "actived" | "forceUpdate" | "remark" | "ext"
      >;
    }

    // for electron service
    namespace Service {}

    // common types
    namespace Common {
      const enum Platform {
        MacOS = "macos",
        Windows = "windows",
      }

      // MacOS does not distinguish between x64 and arm64
      // packages for both architectures are packaged under the same file.
      const enum Archs {
        x32 = "x32",
        x64 = "x64",
        Arm64 = "arm64",
      }

      const enum UpdateType {
        Full = "full",
        Asar = "asar",
      }
    }
  }
}
