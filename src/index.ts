import express from "express";
import logger from "./utils/logger"
import routes from "./routes"
import cors from 'cors';

const port = process.env.NEXT_PUBLIC_PORT || 3001;

const app = express();
app.use(express.json())

const allowedOrigins = ['https://blockchaindev.space'];
const options: cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options));


app.listen(port, async () => {
    logger.info(`App is running at http://localhost:${port}`);
    routes(app);
})