import { IUpdateBadge } from "../interfaces/badges.interfaces";
import badgesServices from "../services/badgesServices";
import { ApiResponse } from "../utils/ApiResponse";


const createBadgeController = async (req: any, res: any, next: any) => {

    try {

        const u = req.user;
        const r = await badgesServices.createBadgeService(
            req.body,
            u,
            req
        );

        res.status(200).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Bagde Created successfully", r, false)
        );

    } catch (error) {
        next(error);
    }
};

const getBadgesByUserController = async (req: any, res: any, next: any) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const userId = req.params.userId;

        const r = await badgesServices.getBadgesByUserPaginatedService(userId, page, limit);

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "", r, false));
    } catch (error) {
        next(error);
    }
};

const getBadgesPaginatedController = async (req: any, res: any, next: any) => {

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const filters = {
            status: req.query.status || undefined,
            search: req.query.search || undefined,
        };

        const r = await badgesServices.getBadgesPaginatedService(
            page,
            limit,
            filters
        );

        res.status(200).json(r);

    } catch (error) {
        next(error);
    }
};

const updateBadgeController = async (req: any, res: any, next: any) => {

    try {

        const badgeId = req.params.id;
        const u = req.user;

        const r = await badgesServices.updateBadgeService(
            badgeId,
            req.body as IUpdateBadge,
            u,
            req
        );

        res.status(200).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Update bagde successfully", r, false)
        );

    } catch (error) {
        next(error);
    }
};

const deleteBadgeController = async (req: any, res: any, next: any) => {
    try {

        const badgeId = req.params.id;
        const u = req.user;

        const r = await badgesServices.deleteBadgeService(
            badgeId,
            u,
            req
        );

        res.status(200).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Delete bagde successfully", r, false)
        );

    } catch (error) {
        next(error);
    }
};


export default {
    createBadgeController,
    getBadgesPaginatedController,
    updateBadgeController,
    deleteBadgeController,
    getBadgesByUserController
}