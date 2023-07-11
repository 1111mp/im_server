import type { Sequelize } from 'sequelize-typescript';

export function transactionHelper(sequelize: Sequelize) {
  const commit = jest.fn();
  const rollback = jest.fn();
  const transaction = jest.fn(async () => ({ commit, rollback }) as any);

  jest.spyOn(sequelize, 'transaction').mockImplementation(transaction);

  return { commit, rollback, transaction };
}
