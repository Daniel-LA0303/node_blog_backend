import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import paymentsService from "../services/paymentsServices";
import PlanSuscription from "../models/Plan";
import { TryPaymentRequestI } from "../interfaces/payment.interfaces";

const newPaymentMethodController = async(
    req: Request, res: Response, next:any
) => {

    try {
        
        // 1. call service
        const newMehtod = await paymentsService.createPaymentMethod(req.body);

        // 2 response api
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Payment method created successfully",
            newMehtod,
            false
        ));

    } catch (error: any) {
        next(error);
    }
}

const getPaymentMethodsByUserController = async(
    req: Request, res: Response, next:any
) => {

    try {
        
        // 1. call service
        const methods = await paymentsService.getPaymentMethodsByUser(req.params.id as string);

        // 2 response api
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Payment method created successfully",
            methods,
            false
        ));

    } catch (error: any) {
        next(error);
    }
}

const deletePaymentMethodController = async(
    req: Request, res: Response, next:any
) => {

    try {
        
        // 1. call service
        await paymentsService.deletePaymentMethod(req.params.id as string);

        // 2 response api
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Payment method delete successfully",
            null,
            false
        ));

    } catch (error: any) {
        next(error);
    }
}

const changeDefaultPaymentMethodController = async(
    req: Request, res: Response, next:any
) => {

    try {
        
        // 1. call service
        await paymentsService.changeDefaultMethod(req.params.id as string, req.query.user as string);

        // 2 response api
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Get Plans successfully",
            null,
            false
        ));

    } catch (error: any) {
        next(error);
    }
}

const getPlansController = async (req: Request, res: Response, next:any) => {

    try {

        // 1. get plans
        const data = await PlanSuscription.find();

        // 2 response api
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Get plan by name successfully",
            data,
            false
        ));
    } catch (error) {
        next(error);
    }
}

const getPlanByNameController = async (req: Request, res: Response, next:any) => {

    try {

        // 1. GET NAME and user
        const name = req.params.id
        const user = req?.user;

        // 2. get by name
        const data = await paymentsService.getPaymentMethodAndPlan(name as string, user._id as string);        

        // 3. response api
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Payment method updated successfully",
            data,
            false
        ));
    } catch (error) {
        next(error);
    }
}

const tryPaymentController = async (req: Request, res: Response, next:any) => {

    try {

        // 1. GET NAME and user
        const data = req.body as TryPaymentRequestI;


        // 2. get by name
        const res2 = await paymentsService.tryPayment(data);        

        // 3. response api
        res.status(201).json(new ApiResponse(
            201,
            req.originalUrl,
            req.method,
            "Payment done successfully",
            res2,
            false
        ));
    } catch (error) {
        next(error);
    }
}


export {
    newPaymentMethodController,
    getPaymentMethodsByUserController,
    deletePaymentMethodController,
    changeDefaultPaymentMethodController,
    getPlansController,    
    getPlanByNameController,
    tryPaymentController
}