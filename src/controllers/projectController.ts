import { CrateProjectRequestI, CreateListRequestI, CreateProjectTaskRequestI, UpdateListRequestI, UpdateProjectRequestI, UpdateProjectTaskRequestI } from "../interfaces/projects.interfaces";
import projectsServices from "../services/projectsServices";
import { ApiResponse } from "../utils/ApiResponse";


const createProjectController = async (req: any, res: any, next: any) => {

    try {

        const data = req.body;
        const r = await projectsServices.createProjectService(data as CrateProjectRequestI);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Create project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}


const updateProjectController = async (req: any, res: any, next: any) => {

    try {

        const data = req.body;
        const projectId = req.params.id;
        const r = await projectsServices.updateProjectService(projectId, data as UpdateProjectRequestI);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Update project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const createListController = async (req: any, res: any, next: any) => {

    try {

        const data = req.body;
        const r = await projectsServices.createListService(data as CreateListRequestI);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Create list successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const updateListController = async (req: any, res: any, next: any) => {

    try {

        const data = req.body;
        const listId = req.params.id;
        const r = await projectsServices.updateListService(listId, data as UpdateListRequestI);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Update project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const createTaskController = async (req: any, res: any, next: any) => {

    try {

        const data = req.body;
        const r = await projectsServices.createTaskService(data as CreateProjectTaskRequestI);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Create task successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const updateTaskController = async (req: any, res: any, next: any) => {

    try {

        const data = req.body;
        const taskId = req.params.id;
        const r = await projectsServices.updateTaskService(taskId, data as UpdateProjectTaskRequestI);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Update project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const deleteTaskController = async (req: any, res: any, next: any) => {

    try {

        const taskId = req.params.id;
        const r = await projectsServices.deleteTaskService(taskId);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Delete task successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const userInToProjectController = async (req: any, res: any, next: any) => {

    try {

        const body = req.body;
        const r = await projectsServices.updateProjectMemberService(body);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Add user to project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const getProjectWithInfoController = async (req: any, res: any, next: any) => {

    try {

        const projectId = req.params.id;
        const r = await projectsServices.getProjectWithInfoService(projectId);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Get project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const assignTaskController = async (req: any, res: any, next: any) => {

    try {
        const { id } = req.params;
        const { userId } = req.body;

        const task = await projectsServices.assignTaskService(id, userId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User assigned to task",
                task,
                false
            )
        );

    } catch (error) {
        next(error);
    }
}

const unassignTaskController = async (req: any, res: any, next: any) => {

    try {
        const { id } = req.params;

        const task = await projectsServices.unassignTaskService(id);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User unassigned from task",
                task,
                false
            )
        );

    } catch (error) {
        next(error);
    }
}

const getProjectsByOwnerPaginatedController = async (req: any, res: any, next: any) => {
    try {

        const id = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await projectsServices.getProjectsByOwnerPaginatedService(id, page, limit);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/page" + req.path, req.method, "Success get porjects by user paginated", result, false)
        );

    } catch (error: any) {
        next(error);
    }
}

const getProjectsAsColaboratorController = async (req: any, res: any, next: any) => {
    try {

        const id = req.params.id;
        console.log(id);
        
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const r = await projectsServices.getProjectsAsColaboratorPaginatedService(
            id,
            page,
            limit
        );

        res.status(200).json(new ApiResponse(200, "/api" + req.path, req.method, "", r, false));
    } catch (error) {
        next(error);
    }
};


export default {
    createProjectController,
    updateProjectController,
    createListController,
    updateListController,
    createTaskController,
    updateTaskController,
    deleteTaskController,
    userInToProjectController,
    getProjectWithInfoController,
    assignTaskController,
    unassignTaskController,
    getProjectsByOwnerPaginatedController,
    getProjectsAsColaboratorController
}