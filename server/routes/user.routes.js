import { Router }       from "express";

/* Controllers */
import UserController   from "../controllers/users.controller";
import WallController   from "../controllers/wall.controller";

const UserRoutes = Router();

UserRoutes.get("/", UserController.landingPage);
UserRoutes.post("/signup", UserController.processSignup);
UserRoutes.get("/wall", WallController.wallPage);
UserRoutes.post("/wall/create_post", WallController.createPost);
UserRoutes.post("/wall/remove_post", WallController.removePost);


module.exports = UserRoutes;