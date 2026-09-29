import listsServices from "../services/listsServices";
import { ApiResponse } from "../utils/ApiResponse";


const createStudyListController = async (req: any, res: any, next: any) => {
    try {

        const { owner, title, description } = req.body;

        const r = await listsServices.createStudyListService(
            owner,
            title,
            description
        );

        res.status(201).json(new ApiResponse(201, "/api" + req.path, req.method, "", r, false));

    } catch (error) {
        next(error);
    }
};

const updateStudyListController = async (req: any, res: any, next: any) => {
    try {

        const { listId } = req.params;

        const { owner, title, description, status } = req.body;

        const r = await listsServices.updateStudyListService(
            listId,
            owner,
            title,
            status,
            description,
        );

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "", r, false));

    } catch (error) {
        next(error);
    }
};


const deleteStudyListController = async (req: any, res: any, next: any) => {
    try {

        const { listId } = req.params;
        const owner = req.user._id.toString();

        const r = await listsServices.deleteStudyListService(
            listId,
            owner
        );

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "", r, false));

    } catch (error) {
        next(error);
    }
};

const addStudyListItemController = async (
    req: any,
    res: any,
    next: any
) => {
    try {

        const { listId } = req.params;

        const { resourceType, resourceId } = req.body;

        const owner = req.user._id.toString();

        const r = await listsServices.addStudyListItemService(
            listId,
            owner,
            resourceType,
            resourceId
        );

        res.status(201).json(new ApiResponse(201,"/api" + req.path,req.method,"",r,false));

    } catch (error) {
        next(error);
    }
};

const updateStudyListItemController = async (
    req: any,
    res: any,
    next: any
) => {
    try {

        const { listId, itemId } = req.params;

        const { order } = req.body;

        const owner = req.user._id.toString();

        const r = await listsServices.updateStudyListItemService(
            listId,
            itemId,
            owner,
            order
        );

        res.status(200).json(new ApiResponse(200,"/api" + req.path,req.method,"",r,false));

    } catch (error) {
        next(error);
    }
};

const deleteStudyListItemController = async (
    req: any,
    res: any,
    next: any
) => {
    try {

        const { listId, itemId } = req.params;

        const owner = req.user._id.toString();

        const r = await listsServices.deleteStudyListItemService(
            listId,
            itemId,
            owner
        );

        res.status(200).json(new ApiResponse(200,"/api" + req.path,req.method,"",r,false));

    } catch (error) {
        next(error);
    }
};

const getStudyListsController = async (
    req: any,
    res: any,
    next: any
) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const owner = req.user._id.toString();

        const r = await listsServices.getStudyListsPaginatedService(
            owner,
            page,
            limit
        );

        res.status(200).json(new ApiResponse(200,"/api" + req.path,req.method,"",r,false));

    } catch (error) {
        next(error);
    }
};

const getStudyListItemsController = async (
    req: any,
    res: any,
    next: any
) => {
    try {

        const { listId } = req.params;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const owner = req.user._id.toString();

        const r = await listsServices.getStudyListItemsPaginatedService(
            listId,
            owner,
            page,
            limit
        );

        res.status(200).json(new ApiResponse(200,"/api" + req.path,req.method,"",r,false));

    } catch (error) {
        next(error);
    }
};

const getStudyListController = async (
    req: any,
    res: any,
    next: any
) => {
    try {

        const { listId } = req.params;
        
        const r = await listsServices.getStudyListService(listId);

        res.status(200).json(new ApiResponse(200,"/api" + req.path,req.method,"",r,false));

    } catch (error) {
        next(error);
    }
};

const reorderStudyListItemsController = async (
    req: any,
    res: any,
    next: any
) => {
    try {

        const { listId } = req.params;
        const { items } = req.body;
        const userId = req.user._id.toString();

        const r = await listsServices.reorderStudyListItemsService(listId, userId, items);

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "Items reordered", r, false));

    } catch (error) {
        next(error);
    }
};

const getResourceListMembershipController = async (req: any, res: any, next: any) => {
    try {
        const { resourceType, resourceId } = req.query;
        const userId = req.user._id.toString();

        if (!resourceType || !resourceId) {
            throw new ServiceException("resourceType and resourceId are required.", 400);
        }

        const r = await listsServices.getResourceListMembershipService(userId, resourceType, resourceId);

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "", r, false));
    } catch (error) {
        next(error);
    }
};


export default {
    createStudyListController,
    updateStudyListController,
    deleteStudyListController,
    addStudyListItemController,
    updateStudyListItemController,
    deleteStudyListItemController,
    getStudyListsController,
    getStudyListItemsController,
    getStudyListController,
    reorderStudyListItemsController,
    getResourceListMembershipController
};