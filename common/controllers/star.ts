import { Op } from "sequelize/lib/sequelize";

const { Star } = require("../models");

export async function findOne(params: { userId: number; dynamicId: number }) {
  return Star.findOne({
    where: {
      userId: {
        [Op.eq]: params.userId,
      },
      dynamicId: {
        [Op.eq]: params.dynamicId,
      },
    },
  });
}

export async function createOne(params: {
  userId: number;
  dynamicId: number;
  status: 0 | 1;
}) {
  console.log(params);
  try {
    await Star.create(params);
  } catch (err) {
    throw err;
  }
}

export async function updateStatus(params: {
  userId: number;
  dynamicId: number;
  status: 0 | 1;
}) {
  try {
    await Star.update(
      { status: params.status },
      {
        where: {
          userId: {
            [Op.eq]: params.userId,
          },
          dynamicId: {
            [Op.eq]: params.dynamicId,
          },
        },
      }
    );
  } catch (err) {
    throw err;
  }
}

export async function getCount(dynamicId: number) {
  return Star.count({
    where: {
      dynamicId: {
        [Op.eq]: dynamicId,
      },
      status: {
        [Op.eq]: 1,
      },
    },
  });
}
