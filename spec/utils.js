import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const cleanUpDatabase = async function () {
  await Promise.all([User.deleteMany()]);
};
