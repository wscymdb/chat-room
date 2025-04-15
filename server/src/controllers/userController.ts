import { Request, Response } from "express";
import { readData } from "../utils/fileStorage";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const data = await readData();
    res.json(data.users);
  } catch (error) {
    res.status(500).json({ message: "获取用户列表失败" });
  }
};
