import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// 获取数据文件的路径
export const getDataFilePath = (fileName: string = "data.json") => {
  const envPath = process.env.DATA_FILE_PATH;
  let basePath;

  if (envPath) {
    // 如果是绝对路径，直接使用
    if (path.isAbsolute(envPath)) {
      basePath = path.dirname(envPath);
    } else {
      // 如果是相对路径，转换为相对于项目根目录的路径
      basePath = path.join(process.cwd(), path.dirname(envPath));
    }
  } else {
    // 默认路径
    basePath = path.join(process.cwd(), "data");
  }

  return path.join(basePath, fileName);
};

// 用于data.json的默认路径
const DATA_FILE_PATH = getDataFilePath();

export const readData = async () => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // 如果文件不存在，创建目录并初始化数据
      await fs.promises.mkdir(path.dirname(DATA_FILE_PATH), {
        recursive: true,
      });
      const initialData = { users: [], messages: [], onlineUsers: [] };
      await fs.promises.writeFile(
        DATA_FILE_PATH,
        JSON.stringify(initialData, null, 2)
      );
      return initialData;
    }

    const data = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("读取数据文件失败:", error);
    return { users: [], messages: [], onlineUsers: [] };
  }
};

export const writeData = async (data: any) => {
  try {
    await fs.promises.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.promises.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("写入数据文件失败:", error);
    throw error;
  }
};
