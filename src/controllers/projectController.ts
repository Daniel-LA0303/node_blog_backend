import { CrateProjectRequestI, CreateListRequestI, CreateProjectTaskRequestI, UpdateListRequestI, UpdateProjectRequestI } from "../interfaces/projects.interfaces";
import projectsServices from "../services/projectsServices";
import { emitToProject } from "../socketIO/projectEmitter";
import { ApiResponse } from "../utils/ApiResponse";


const createProjectController = async (req: any, res: any, next: any) => {

    try {

        let data: CrateProjectRequestI = req.body;
        const user = req.user._id.toString();
        data.userAction = user;
        const r = await projectsServices.createProjectService(data);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Create project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}


const updateProjectController = async (req: any, res: any, next: any) => {

    try {

        let data: UpdateProjectRequestI = req.body;
        const user = req.user._id.toString();
        data.userAction = user;
        const projectId = req.params.id;
        const r = await projectsServices.updateProjectService(projectId, data);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Update project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const createListController = async (req: any, res: any, next: any) => {

    try {

        let data: CreateListRequestI = req.body;
        const user = req.user._id.toString();
        data.userAction = user;

        const r = await projectsServices.createListService(data);

        emitToProject(req, r.project.toString(), 'list:created', {
            _id: r._id,
            projectId: r.project.toString(),
            name: r.name,
            order: r.position,
        });
        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Create list successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const updateListController = async (req: any, res: any, next: any) => {

    try {

        let data: UpdateListRequestI = req.body;
        const user = req.user._id.toString();
        data.userAction = user;
        const listId = req.params.id;
        const r = await projectsServices.updateListService(listId, data);

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Update project successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const createTaskController = async (req: any, res: any, next: any) => {

    try {

        let data: CreateProjectTaskRequestI = req.body;
        const user = req.user._id.toString();
        data.userAction = user;
        const r = await projectsServices.createTaskService(data);

        emitToProject(req, r.project.toString(), 'task:created', {
            _id: r._id, listId: r.list, title: r.title, description: r.description,
            order: r.position, assignedUsers: [],
        })

        res.status(201).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Create task successfully", r, false)
        );
    } catch (error) {
        next(error);
    }
}

const updateTaskController = async (req: any, res: any, next: any) => {
    try {
        const taskId = req.params.id;
        const data = { ...req.body, userAction: req.user._id.toString() };

        const { task, moved } = await projectsServices.updateTaskService(taskId, data);
        const projectId = task.project.toString();

        if (moved) {
            emitToProject(req, projectId, 'task:moved', {
                taskId,
                toListId: task.list.toString(),
                toIndex: task.position,
            });
        } else {
            emitToProject(req, projectId, 'task:updated', {
                _id: task._id,
                title: task.title,
                description: task.description,
            });
        }

        res.status(200).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Update task successfully", task, false)
        );
    } catch (error) {
        next(error);
    }
}

const deleteTaskController = async (req: any, res: any, next: any) => {

    try {

        const taskId = req.params.id;
        const user = req.user._id.toString();
        const r = await projectsServices.deleteTaskService(taskId, user);

        emitToProject(req, r, 'task:deleted', { taskId });

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
        const r = await projectsServices.updateProjectMemberService(body, req);

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
        const userR = req.user._id.toString();

        const r = await projectsServices.assignTaskService(id, userId, userR);
        const taskId = r.newTask._id.toString();
        const user = r.user;

        emitToProject(
            req,
            r.projectId,
            'task:assigned',
            {
                taskId, user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture
                }
            }
        )


        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User assigned to task",
                r.newTask,
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

const reorderListsController = async (req: any, res: any, next: any) => {
    try {
        const { projectId, lists } = req.body;
        const user = req.user._id.toString();

        await projectsServices.reorderListsService(projectId, lists, user);

        emitToProject(req, projectId, 'lists:reordered', lists);

        res.status(200).json(
            new ApiResponse(200, "/api" + req.path, req.method, "Lists reordered successfully", { ok: true }, false)
        );
    } catch (error) {
        next(error);
    }
}

const getLastActivity = async () => {
    
}

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
    getProjectsAsColaboratorController,
    reorderListsController
}