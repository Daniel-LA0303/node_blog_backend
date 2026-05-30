import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import paymentsService from "../services/paymentsServices";

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
            "Payment method updated successfully",
            null,
            false
        ));

    } catch (error: any) {
        next(error);
    }
}


export {
    newPaymentMethodController,
    getPaymentMethodsByUserController,
    deletePaymentMethodController,
    changeDefaultPaymentMethodController
}