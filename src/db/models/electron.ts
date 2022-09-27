import { Sequelize, DataTypes, Model, Optional, BuildOptions } from "sequelize";
import * as moment from "moment";

export type ElectronModel = Model<
  Electron.DB.ElectronAttributes,
  Electron.DB.ElectronCreationAttributes
> &
  Electron.DB.ElectronAttributes & {};

export type ElectronStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): ElectronModel;
};

export function ElectronFactory(sequelize: Sequelize) {
  return <ElectronStatic>sequelize.define("electron", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    platform: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["macos", "windows"]],
      },
      comment: "Electron App platform",
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Electron App version",
    },
    archs: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["x32", "x64", "arm64"]],
      },
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    forceUpdate: {
      type: DataTypes.BOOLEAN,
      field: "force_update",
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["full", "asar"]],
      },
      allowNull: false,
    },
    actived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ext: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue("createdAt")).format(
          "YYYY-MM-DD HH:mm"
        );
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue("updatedAt")).format(
          "YYYY-MM-DD HH:mm"
        );
      },
    },
  });
}
