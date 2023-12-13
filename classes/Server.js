import * as dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import express from 'express'
import OpenAI from 'openai'
import cors from 'cors'
import morgan from 'morgan'
import userRoutes from '../routes/user.route.js'
import authRoutes from "../routes/auth.route.js"
import assistantRoutes from "../routes/assistant.route.js"

// export const app = express()

// const PORT = process.env.PORT || 4000

// export const openai = new OpenAI({
//     apiKey: process.env.OPEN_AI_KEY
// })

class Server {
    app = null;
    port = "null";
    versioning = ""
    openai = {}

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 9000;
        this.versioning = "/api/v1"
        this.addMiddleware()
        this.addRoutes();
        this.connectToDb();
        this.instantiateOpenAI()
    }

    versionThisRoute(route) {
        return this.versioning + route
    }

    instantiateOpenAI() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })
    }

    addMiddleware() {
        this.app.use(cors());
        this.app.use(morgan('dev'))
        this.app.use(express.json());
    }

    addRoutes() {
        this.app.use(this.versionThisRoute("/users"), userRoutes);
        // this.app.use(this.versionThisRoute("/assistant"), assistantRoutes);
        // this.app.use(this.versionThisRoute("/auth"), authRoutes);
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

export default Server
