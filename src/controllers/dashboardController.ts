import dashboardServices from "../services/dashboardServices";
import { ApiResponse } from "../utils/ApiResponse";


const getAllCountDocumentsController = async (req: any, res: any, next: any) => {

    try {

        const response = await dashboardServices.getAllCountDocumentsService();

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                response,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}


const getCountPostsByStatusController = async (req: any, res: any, next: any) => {

    try {

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const response = await dashboardServices.getCountPostsByStatusService(startDate, endDate);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                response,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getTopModeratorsController = async (req: any, res: any, next: any) => {

    try {
        const response = await dashboardServices.getTopModeratorsService();

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                response,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getRecentLogsInfoController = async (req: any, res: any, next: any) => {

    try {
        const response = await dashboardServices.getRecentLogsInfoService();

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                response,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getCategoriesInfoController = async (req: any, res: any, next: any) => {

    try {

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let data: any = {};
        data.mostFollowed = await dashboardServices.getTop5CategoriesByFollowsService();
        data.mostUsed = await dashboardServices.getTop5CategoriesByDateRangeService(startDate, endDate);
        data.range = {
            "startDate": startDate,
            "endDate": endDate
        }

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                data,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getEngagementStatsByDateRangeController = async (req: any, res: any, next: any) => {

    try {

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;


        const r = await dashboardServices.getEngagementStatsByDateRangeService(startDate, endDate);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                r,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getCountReportsByStatusController = async (req: any, res: any, next: any) => {

    try {

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const r = await dashboardServices.getCountReportsByStatusService(startDate, endDate);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                r,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getMessagesLast7DaysController = async (req: any, res: any, next: any) => {

    try {

        const r = await dashboardServices.getMessagesLast7DaysService();

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                r,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getNotificationsLast7DaysController = async (req: any, res: any, next: any) => {

    try {

        const r = await dashboardServices.getNotificationsLast7DaysService();

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                r,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}


const getUsersByStatusDateRangeController = async (req: any, res: any, next: any) => {

    try {

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;


        const r = await dashboardServices.getUsersByStatusDateRangeService(startDate, endDate);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                r,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

const getModerationActionsByDateRangeSController = async (req: any, res: any, next: any) => {

    try {

        const startDate = req.query.startDate;
        const endDate = req.query.endDate;


        const r = await dashboardServices.getModerationActionsByDateRangeService(startDate, endDate);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Category created successfully",
                r,
                false
            )
        );
    } catch (error) {
        console.error(error);
        next(error);
    }

}

export {
    getAllCountDocumentsController,
    getCountPostsByStatusController,
    getTopModeratorsController,
    getRecentLogsInfoController,
    getCategoriesInfoController,
    getEngagementStatsByDateRangeController,
    getCountReportsByStatusController,
    getMessagesLast7DaysController,
    getNotificationsLast7DaysController,
    getUsersByStatusDateRangeController,
    getModerationActionsByDateRangeSController
}