import { Request, Response } from "express";
import { readData } from "../utils/fileStorage";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const data = await readData();
    res.json(data.messages);
  } catch (error) {
    res.status(500).json({ message: "获取消息失败" });
  }
};
