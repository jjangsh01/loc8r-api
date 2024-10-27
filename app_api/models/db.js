const mongoose = require("mongoose");
// const dbURI = "mongodb://localhost/Loc8r";
const readLine = require("readline");
const dbPassword = process.env.MONGODB_PASSWORD;

const dbURI = `mongodb+srv://myatlasdbuser:${dbPassword}@cluster0.samyl.mongodb.net/Loc8r`;

const connect = () => {
    setTimeout(() => mongoose.connect(dbURI, { useNewUrlParser: true }), 1000);
};

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to " + dbURI);
});

mongoose.connection.on("error", (err) => {
    console.log("error: " + err);
    return connect();
});

mongoose.connection.on("disconnected", () => {
    console.log("disconnected");
});

if (process.platform === "win32") {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.on("SIGINT", () => {
        process.emit("SIGINT");
    });
}

const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

process.once("SIGUSR2", () => {
    gracefulShutdown("nodemon restart", () => {
        process.kill(process.pid, "SIGUSR2");
    });
});
process.on("SIGINT", () => {
    gracefulShutdown("app termination", () => {
        process.exit(0);
    });
});
process.on("SIGTERM", () => {
    gracefulShutdown("Heroku app shutdown", () => {
        process.exit(0);
    });
});

connect();

require("./locations");