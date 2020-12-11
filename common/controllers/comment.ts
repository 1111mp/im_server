import { Op } from "sequelize/lib/sequelize";

const { Comment } = require("../models");

export async function createOne(params: {
  userId: number;
  dynamicId: number;
  content: string;
}) {
  try {
    await Comment.create(params);
  } catch (err) {
    throw err;
  }
}

export async function getAll(params: { userId: number; dynamicId: number }) {
  return Comment.findAll({
    attributes: ["dynamicId", "content", "createdAt"],
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
