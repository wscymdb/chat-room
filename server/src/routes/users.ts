import { Router } from "express";
import { getUsers } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);

export const userRoutes = router;
