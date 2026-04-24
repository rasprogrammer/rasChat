import express, {} from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    return res.json({
        message: 'setup success'
    });
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.listen(8000, () => console.log('server started'));
//# sourceMappingURL=server.js.map