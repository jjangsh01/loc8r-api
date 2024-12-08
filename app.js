const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const cors = require("cors");
// require('./app_server/models/db');
require("dotenv").config();
require("./app_api/models/db");
require("./app_api/config/passport");

// const indexRouter = require("./app_server/routes/index");
const usersRouter = require("./app_server/routes/users");
const apiRouter = require("./app_api/routes/index");

var app = express();

const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/api", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인 허용
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // 올바른 헤더 이름으로 수정
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // 허용할 HTTP 메서드 명시
    if (req.method === "OPTIONS") {
        return res.status(200).json({}); // OPTIONS 요청 시 빠르게 응답
    }
    next();
});

// view engine setup
app.set("views", path.join(__dirname, "app_server", "views"));
app.set("view engine", "pug");
app.get(/(\/about)|(\/location\/[a-z0-9]{24})/, function (req, res, next) {
    res.sendFile(path.join(__dirname, "app_public", "build/browser", "index.html"));
});
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "app_public", "build")));
app.use(express.static(path.join(__dirname, "app_public")));
app.use(passport.initialize());
app.use("/users", usersRouter);

//app.use("/", indexRouter);

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ message: err.name + ": " + err.message + " by 2020810010 김수현" });
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
