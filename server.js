import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
dotenv.config()

export const app = express()

const PORT = process.env.PORT

class Server {
    app = null;
    port = "null";
    versioning = ""

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 9000;
        this.versioning = "/api/v1"
        this.addMiddleware()
        this.addRoutes();
        // this.connectToDb();
    }

    versionThisRoute(route) {
        return this.versioning + route
    }

    addMiddleware() {
        this.app.use(cors());
        this.app.use(morgan('dev'))
        this.app.use(express.json());
    }

    addRoutes() {
        // this.app.use(this.versionThisRoute("/users"), userRoutes);

    }

    async connectToDb() {
        mongoose.set({ strictQuery: false });
        const dbUrl = process.env.MONGODB_URL || "";
        try {
            console.log("connecting to db...");
            await mongoose.connect(dbUrl);
            this.startServer();
        } catch (error) {
            console.error("Could not connect to DB", error);
        }
    }

    startServer() {
        this.app.listen(this.port, () =>
            console.log(`Server up at http://localhost:${this.port}`)
        );
    }
}

new Server()

export default Server
