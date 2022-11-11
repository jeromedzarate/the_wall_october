import Express      from "express";
import BodyParser   from "body-parser";
import Path         from "path";
import session      from "express-session";

/* Constants */
import Constants    from "./config/constants";

/* Routes */
import UserRoutes   from "./routes/user.routes";

const App = Express();

App.use(session({
    secret: "secret",
    saveUninitialized: true,
    cookie: { maxAge: 1000000000000 * 60 * 60 * 24 },
    resave: false
}));
App.use(BodyParser.json({ limit: "50mb" }));
App.use(BodyParser.urlencoded({ limit: "50mb", extended: true }));

App.set("views", Path.join(__dirname, "..", "views"));
App.use("/assets", Express.static(Path.join(__dirname, "..", "assets")));
App.set("view engine", "ejs");

App.use("/", UserRoutes);

App.listen(Constants.PORT, () => {
    console.log(`Listening to port ${ Constants.PORT }`);
});