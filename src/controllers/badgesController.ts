import { IUpdateBadge } from "../interfaces/badges.interfaces";
import badgesServices from "../services/badgesServices";
import { ApiResponse } from "../utils/ApiResponse";


const createBadgeController = async (req: any, res: any, next: any) => {

    try {

        const r = await badgesServices.createBadgeService(
            req.body
        );

        res.status(200).json(
            new ApiResponse(200,"/api" + req.path,req.method,"Bagde Created successfully",r,false)
        );

    } catch (error) {
        next(error);
    }
};

const getBadgesPaginatedController = async (req: any,res: any, next: any) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const r = await badgesServices.getBadgesPaginatedService(
            page,
            limit
        );

        res.status(200).json(
            new ApiResponse(200,"/api" + req.path,req.method,r,"Badges paginated",false)
        );

    } catch (error) {
        next(error);
    }
};

const updateBadgeController = async (req: any, res: any, next: any) => {

    try {

        const badgeId = req.params.id;

        const r = await badgesServices.updateBadgeService(
            badgeId,
            req.body as IUpdateBadge
        );

        res.status(200).json(
            new ApiResponse(200,"/api" + req.path,req.method,"Update bagde successfully",r,false)
        );

    } catch (error) {
        next(error);
    }
};

const deleteBadgeController = async (req: any, res: any, next: any) => {
    try {

        const badgeId = req.params.id;

        const r = await badgesServices.deleteBadgeService(
            badgeId
        );

        res.status(200).json(
            new ApiResponse(200,"/api" + req.path,req.method,"Delete bagde successfully",r,false)
        );

    } catch (error) {
        next(error);
    }
};

export default {
    createBadgeController,
    getBadgesPaginatedController,
    updateBadgeController,
    deleteBadgeController
}