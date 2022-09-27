import { DB } from "src/db";
import { RedisType } from "src/redis";

/**
 * @description: Electron service
 * @class
 * @public
 */
export class ElectronService {
  /**
   * @description: create an instance of Electron service
   * @constructor
   * @param {DB} db - private
   * @param {RedisType} redis - private
   */
  public constructor(private db: DB, private redis: RedisType) {}

  /**
   * @description: Create and insert an Electron instances in bulk
   * @param {Electron.DB.ElectronCreationAttributes} params
   * @return {Promise<ElectronModel>}
   */
  public create = async (params: Electron.DB.ElectronCreationAttributes) => {
    return this.db.Electron.create(params);
  };

  /**
   * @description: Create and insert multiple Electron instances in bulk.
   * @param {Electron.DB.ElectronCreationAttributes[]} params
   * @return {Promise<ElectronModel[]>}
   */
  public createMultiple = async (
    params: Electron.DB.ElectronCreationAttributes[]
  ) => {
    return this.db.Electron.bulkCreate(params);
  };

  public findOne = async (version: string, archs: Electron.Common.Archs) => {
    return this.db.Electron.findOne({
      where: {
        version,
        archs,
      },
    });
  };
}
