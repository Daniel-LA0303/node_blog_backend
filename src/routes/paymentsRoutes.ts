import express from "express";
import { changeDefaultPaymentMethodController, deletePaymentMethodController, getPaymentMethodsByUserController, getPlanByNameController, getPlansController, newPaymentMethodController, tryPaymentController } from "../controllers/paymentsController";
import checkAuth from "../middleware/checkAuth";

const router = express.Router();

router.post('/new-payment-method', checkAuth, newPaymentMethodController);
router.get('/get-methods/:id', checkAuth, getPaymentMethodsByUserController);
router.delete('/delete-method/:id', checkAuth, deletePaymentMethodController);
router.post('/change-defualt-method/:id', checkAuth, changeDefaultPaymentMethodController);

router.get('/get-plans', getPlansController);
router.get('/get-plan-by-name/:id',checkAuth ,getPlanByNameController);
router.post('/subscribe', checkAuth, tryPaymentController);

export default router;