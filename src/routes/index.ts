import { Router } from "express";
import authRouter from "./auth";
import productsRouter from "./products";
import orderRouter from "./orders";
import rootRouter from "./root";
import plansRouter from "./plans";
import paymentRouter from "./payments";
import transactionRouter from "./transactions";
import { getCities } from "../features/salla/orders";
import Authentication from "../middlewares/authentication";
import aliexpressRoutes from "./aliepress"
const router: Router = Router();

router.use("/auth", authRouter);
router.use("/orders", orderRouter);
router.use("/plans", plansRouter);
router.use("/transactions", transactionRouter);

router.use("/products/v1", productsRouter);
router.use("/v1/payments", paymentRouter);
router.use("/", rootRouter);
router.use('/salla/cities',Authentication(),getCities)

router.use('/aliexpress',aliexpressRoutes)

export default router;
