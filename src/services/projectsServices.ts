import { assign } from "nodemailer/lib/shared";
import { CrateProjectRequestI, CreateEventI, CreateListRequestI, CreateProjectTaskRequestI, UpdateListRequestI, UpdateProjectMemberRequestI, UpdateProjectRequestI, UpdateProjectTaskRequestI } from "../interfaces/projects.interfaces";
import { ProjectList } from "../models/ProjectList";
import { Project } from "../models/Projects";
import { ProjectTask } from "../models/ProjectTask";
import { ServiceException } from "../utils/exception/ServiceException";
import User from "../models/User";
import { ProjectMember } from "../models/ProjectMember";
import { ProjectEvent } from "../models/ProjectEvents";
import { ActionProject } from "../enums/projects.enums";
import { getReceiverSocketId, io } from "../socketIO/server";
import { emitToProject, emitToProjectRoom } from "../socketIO/projectEmitter";
import badgesServices from "./badgesServices";
//import { emitToProject } from "../socketIO/projectEmitter";
//import { getReceiverSocketId, io } from "../socketIO/server";

const createEventProjectService = async (d: CreateEventI) => {

    // search user
    const u = await User.findById(d.user);

    const desc = (() => {
        switch (d.type) {
            case ActionProject.CREATE_PROJECT:
                return `${u?.name} has created a project`;

            case ActionProject.UPDATE_PROJECT:
                return `${u?.name} has updated a project`;

            case ActionProject.CREATE_TASK:
                return `${u?.name} has created a task`;

            case ActionProject.UPDATE_TASK:
                return `${u?.name} has updated a task`;

            case ActionProject.DELETE_TASK:
                return `${u?.name} has deleted a task`;

            case ActionProject.CREATE_LIST:
                return `${u?.name} has created a list`;

            case ActionProject.UPDATE_LIST:
                return `${u?.name} has updated a list`;

            case ActionProject.ASSING_USER:
                return `${u?.name} has assigned a user`;

            default:
                return `${u?.name} performed an action`;
        }
    })();

    const event = await ProjectEvent.create({
        project: d.project,
        user: d.user,
        description: desc,
        type: d.type,
        entity: d.entity,
        entityId: d.entityId
    });

    // el socket nunca debe romper la petición HTTP
    try {
        // JSON round trip: convierte ObjectId y fechas a string, igual que verá el front
        emitToProjectRoom(d.project, 'activity:created', JSON.parse(JSON.stringify(event)));
    } catch (error) {
        console.error('activity emit error:', error);
    }

    return event;
}

const getProjectWithInfoService = async (projectId: string) => {

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ServiceException("Project not found", 404);
    }

    const members = await ProjectMember.find({
        project: project.id
    }).populate({
        path: 'user',
        select: '_id name email profilePicture'
    });

    const lists = await ProjectList.find({
        project: project.id
    }).lean();

    const tasks = await ProjectTask.find({
        project: project.id
    }).populate({
        path: 'assignedTo',
        select: '_id name email profilePicture'
    }).lean();

    const formattedLists = lists.map(list => ({
        _id: list._id,
        projectId: list.project,
        name: list.name,
        order: list.position
    }));

    const formattedTasks = tasks.map(task => ({
        _id: task._id,
        listId: task.list,
        title: task.title,
        description: task.description,
        order: task.position,
        assignedUsers: task.assignedTo
            ? [task.assignedTo]
            : [],
    }));

    const r = await getLastActivityProjectService(project._id.toString());

    return {
        project: {
            ...project.toObject(),
            members: members.map(member => member.user)
        },
        lists: formattedLists,
        tasks: formattedTasks,
        lastAcivity: r
    };
};

const createProjectService = async (request: CrateProjectRequestI) => {

    // 1. we create project
    const newProject = await Project.create({
        name: request.name,
        description: request.description,
        owner: request.owner
    });

    const nE: CreateEventI = {
        project: newProject._id.toString(),
        user: request.owner,
        type: ActionProject.CREATE_PROJECT,
        entity: 'Project',
        entityId: newProject._id.toString()
    }

    await createEventProjectService(nE);

    await badgesServices.checkAndAwardBadges(request.owner, 'PROJECT_COUNT')
            .catch(err => console.error('[badges] error', err));

    return {
        projectId: newProject._id
    }
}

const updateProjectService = async (projectId: string, request: UpdateProjectRequestI) => {

    // 1. search project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ServiceException("Project not found", 404);
    }

    project.name = request.name;
    project.description = request.description;
    const newP = await project.save();

    const nE: CreateEventI = {
        project: project._id.toString(),
        user: request?.userAction,
        type: ActionProject.UPDATE_PROJECT,
        entity: 'Project',
        entityId: project._id.toString()
    }

    await createEventProjectService(nE);

    return {
        name: newP.name,
        description: newP.description
    }
}

const createListService = async (request: CreateListRequestI) => {

    // we createproject
    const newList = await ProjectList.create({
        project: request.project,
        name: request.name,
        position: request.position
    });

    const nE: CreateEventI = {
        project: request.project,
        user: request?.userAction,
        type: ActionProject.CREATE_LIST,
        entity: 'ProjectList',
        entityId: newList._id.toString()
    }

    await createEventProjectService(nE);

    return newList;
}

const updateListService = async (listId: string, request: UpdateListRequestI) => {

    // 1. search list
    const list = await ProjectList.findById(listId);

    if (!list) {
        throw new ServiceException("List not found", 404);
    }

    list.name = request.name;
    list.position = request.position;
    const newL = await list.save();

    const nE: CreateEventI = {
        project: list.project.toString(),
        user: request?.userAction,
        type: ActionProject.UPDATE_LIST,
        entity: 'ProjectList',
        entityId: list._id.toString()
    }

    await createEventProjectService(nE);

    return {
        name: newL.name,
        position: newL.position
    }
}

const createTaskService = async (request: CreateProjectTaskRequestI) => {

    // we createproject
    const newTask = await ProjectTask.create({
        project: request.project,
        list: request.list,
        title: request.title,
        description: request.description,
        position: request.position,
        assignedTo: request.assignedTo,
        createdBy: request.createdBy,
    });

    const nE: CreateEventI = {
        project: newTask.project.toString(),
        user: request?.userAction,
        type: ActionProject.CREATE_TASK,
        entity: 'ProjectTask',
        entityId: newTask._id.toString()
    }

    await createEventProjectService(nE);

    return newTask;
}

const updateTaskService = async (taskId: string, request: UpdateProjectTaskRequestI) => {
    const task = await ProjectTask.findById(taskId);
    if (!task) {
        throw new ServiceException("Task not found", 404);
    }

    const project = await Project.findById(task.project);
    if (!project) {
        throw new ServiceException("Project not found", 404);
    }

    const fromListId = task.list.toString();
    const toListId = request.list ?? fromListId;
    const oldPosition = task.position;
    const isChangingList = request.list !== undefined && request.list !== fromListId;
    const isChangingPosition = request.position !== undefined && request.position !== oldPosition;
    const moved = isChangingList || isChangingPosition;

    if (request.list) {
        const list = await ProjectList.findById(request.list);
        if (!list) {
            throw new ServiceException("List not found", 404);
        }
    }

    if (request.title !== undefined) task.title = request.title;
    if (request.description !== undefined) task.description = request.description;

    if (moved) {
        const targetCount = await ProjectTask.countDocuments({
            list: toListId,
            _id: { $ne: task._id },
        });

        // Asegurar que la nueva posición no exceda el límite disponible
        const newPosition = Math.min(request.position ?? targetCount, targetCount);

        if (isChangingList) {
            // 1. Abrir espacio en la lista destino (incrementar las posiciones >= newPosition)
            await ProjectTask.updateMany(
                { list: toListId, position: { $gte: newPosition } },
                { $inc: { position: 1 } }
            );

            // 2. Cerrar el hueco en la lista origen (decrementar las posiciones > oldPosition)
            await ProjectTask.updateMany(
                { list: fromListId, position: { $gt: oldPosition } },
                { $inc: { position: -1 } }
            );
        } else if (isChangingPosition) {
            // Reordenamiento dentro de la misma lista
            if (newPosition > oldPosition) {
                // Mover hacia abajo: decrementar las intermedias
                await ProjectTask.updateMany(
                    {
                        list: fromListId,
                        _id: { $ne: task._id },
                        position: { $gt: oldPosition, $lte: newPosition },
                    },
                    { $inc: { position: -1 } }
                );
            } else {
                // Mover hacia arriba: incrementar las intermedias
                await ProjectTask.updateMany(
                    {
                        list: fromListId,
                        _id: { $ne: task._id },
                        position: { $gte: newPosition, $lt: oldPosition },
                    },
                    { $inc: { position: 1 } }
                );
            }
        }

        task.list = toListId as any;
        task.position = newPosition;
    }

    const saved = await task.save();

    await createEventProjectService({
        project: project._id.toString(),
        user: request?.userAction,
        type: ActionProject.UPDATE_TASK,
        entity: "ProjectTask",
        entityId: task._id.toString(),
    });

    return { task: saved, moved };
};

/*const updateTaskService = async (taskId: string, request: UpdateProjectTaskRequestI) => {

    const task = await ProjectTask.findById(taskId);
    if (!task) {
        throw new ServiceException("Task not found", 404);
    }

    const project = await Project.findById(task.project);
    if (!project) {
        throw new ServiceException("Project not found", 404);
    }

    const fromListId = task.list.toString();
    const toListId = request.list ?? fromListId;
    const moved = request.list !== undefined || request.position !== undefined;

    if (request.list) {
        const list = await ProjectList.findById(request.list);
        if (!list) {
            throw new ServiceException("List not found", 404);
        }
    }

    if (request.title !== undefined) task.title = request.title;
    if (request.description !== undefined) task.description = request.description;

    if (moved) {
        // tareas de la lista destino, sin la que se mueve
        const siblings = await ProjectTask.find({
            list: toListId,
            _id: { $ne: task._id },
        }).sort({ position: 1 });

        const idx = Math.min(request.position ?? siblings.length, siblings.length);

        // hacer espacio: las que quedan antes de idx conservan i, las demás suben una posición
        if (siblings.length > 0) {
            await ProjectTask.bulkWrite(
                siblings.map((t, i) => ({
                    updateOne: {
                        filter: { _id: t._id },
                        update: { $set: { position: i < idx ? i : i + 1 } },
                    },
                }))
            );
        }

        task.list = toListId as any;
        task.position = idx;
    }

    const saved = await task.save();

    // cerrar el hueco en la lista origen (después del save, para que la tarea ya no cuente ahí)
    if (moved && fromListId !== toListId) {
        const source = await ProjectTask.find({ list: fromListId }).sort({ position: 1 });
        if (source.length > 0) {
            await ProjectTask.bulkWrite(
                source.map((t, i) => ({
                    updateOne: {
                        filter: { _id: t._id },
                        update: { $set: { position: i } },
                    },
                }))
            );
        }
    }

    await createEventProjectService({
        project: project._id.toString(),
        user: request?.userAction,
        type: ActionProject.UPDATE_TASK,
        entity: 'ProjectTask',
        entityId: task._id.toString(),
    });

    return { task: saved, moved };
}*/

const deleteTaskService = async (taskId: string, userAction: string) => {

    // 1. search task
    const task = await ProjectTask.findById(taskId);
    if (!task) {
        throw new ServiceException("Task not found", 404);
    }

    const tI = task.project.toString();

    const nE: CreateEventI = {
        project: task.project.toString(),
        user: userAction,
        type: ActionProject.DELETE_TASK,
        entity: 'ProjectTask',
        entityId: task._id.toString()
    }

    await createEventProjectService(nE);

    await task.remove();

    return tI
}


const updateProjectMemberService = async (
    request: UpdateProjectMemberRequestI,
    r: any
) => {

    // 1. Search project
    const project = await Project.findById(request.projectId);

    if (!project) {
        throw new ServiceException("Project not found", 404);
    }

    // 2. Search user
    const user = await User.findById(request.userId);

    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 3. Search membership
    let projectMember = await ProjectMember.findOne({
        project: request.projectId,
        user: request.userId,
    });

    // 4. Create membership if it doesn't exist
    if (!projectMember) {

        if (request.status === "REMOVED") {
            throw new ServiceException(
                "User is not a member of this project",
                404
            );
        }

        projectMember = await ProjectMember.create({
            project: request.projectId,
            user: request.userId,
            status: "ACTIVE",
        });

        return projectMember;
    }

    // 5. Update existing membership
    projectMember.status = request.status;

    // send socket when delete an user form project
    const sid = getReceiverSocketId(user._id.toString())
    const pI = project._id.toString();
    const uI = project._id.toString();
    if (sid) {
        io.to(sid).emit('project:kicked', { pI })
        io.in(sid).socketsLeave(`project:${pI}`)
    }
    emitToProject(r, project._id.toString(), 'member:removed', { uI })

    await projectMember.save();

    return projectMember;
};

const assignTaskService = async (taskId: string, userId: string, userAction: string) => {

    // 1. search task
    const task = await ProjectTask.findById(taskId);
    if (!task) {
        throw new ServiceException("Task not found", 404);
    }

    // 2. search user
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 3. the user must be an active member of the task's project
    const membership = await ProjectMember.findOne({
        project: task.project,
        user: userId,
        status: "ACTIVE",
    });
    if (!membership) {
        throw new ServiceException("User is not a member of this project", 400);
    }

    // 4. assign (replaces whoever was assigned before)
    task.assignedTo = userId as any;
    const newTask = await task.save();

    const nE: CreateEventI = {
        project: task.project.toString(),
        user: userAction,
        type: ActionProject.ASSING_USER,
        entity: 'ProjectMember',
        entityId: task._id.toString()
    }

    await createEventProjectService(nE);

    return {
        newTask,
        projectId: task.project.toString(),
        user
    };
};

const unassignTaskService = async (taskId: string) => {

    // 1. search task
    const task = await ProjectTask.findById(taskId);
    if (!task) {
        throw new ServiceException("Task not found", 404);
    }

    // 2. clear assignment
    task.assignedTo = undefined as any;
    const newTask = await task.save();

    return newTask;
};

const getProjectsByOwnerPaginatedService = async (userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const projects = await Project.find({
        owner: userId,
        status: { $ne: 'DELETED' }
    })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name')
        .sort({ createdAt: -1 });

    const total = await Project.countDocuments({
        owner: userId,
        status: { $ne: 'DELETED' }
    });

    return {
        projects,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}


const getProjectsAsColaboratorPaginatedService = async (userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    // 1. ids of the projects where the user is an active member
    const projectIds = await ProjectMember.distinct('project', {
        user: userId,
        status: 'ACTIVE'
    });

    // 2. those projects, excluding the ones the user owns and deleted ones
    const filter = {
        _id: { $in: projectIds },
        owner: { $ne: userId },
        status: { $ne: 'DELETED' }
    };

    const [projects, total] = await Promise.all([
        Project.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('owner', 'name') // optional: show who owns the project
            .lean(),
        Project.countDocuments(filter)
    ]);

    return {
        projects,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const reorderListsService = async (
    projectId: string,
    lists: { _id: string; order: number }[],
    userAction: string
) => {
    if (!Array.isArray(lists) || lists.length === 0) {
        throw new ServiceException("Lists are required", 400);
    }

    // Validar que todas las listas pertenezcan al proyecto
    const ids = lists.map((l) => l._id);
    const count = await ProjectList.countDocuments({ _id: { $in: ids }, project: projectId });
    if (count !== ids.length) {
        throw new ServiceException("Invalid lists for this project", 400);
    }

    // Actualizar las posiciones ejecutando updateOne en paralelo
    await Promise.all(
        lists.map((l) =>
            ProjectList.updateOne(
                { _id: l._id, project: projectId },
                { $set: { position: l.order } }
            )
        )
    );

    await createEventProjectService({
        project: projectId,
        user: userAction,
        type: ActionProject.UPDATE_LIST,
        entity: 'ProjectList',
        entityId: ids[0],
    });
};
/*const reorderListsService = async (
    projectId: string,
    lists: { _id: string; order: number }[],
    userAction: string
) => {
    if (!Array.isArray(lists) || lists.length === 0) {
        throw new ServiceException("Lists are required", 400);
    }

    // todas deben pertenecer al proyecto
    const ids = lists.map((l) => l._id);
    const count = await ProjectList.countDocuments({ _id: { $in: ids }, project: projectId });
    if (count !== ids.length) {
        throw new ServiceException("Invalid lists for this project", 400);
    }

    await ProjectList.bulkWrite(
        lists.map((l) => ({
            updateOne: {
                filter: { _id: l._id, project: projectId },
                update: { $set: { position: l.order } },
            },
        }))
    );

    await createEventProjectService({
        project: projectId,
        user: userAction,
        type: ActionProject.UPDATE_LIST,
        entity: 'ProjectList',
        entityId: ids[0], 
    });
};*/

const getLastActivityProjectService = async (projectId: string) => {

    const lastActivity = ProjectEvent.find({
        project: projectId
    })
        .limit(20)
        .sort({
            createdAt: -1
        });

    return lastActivity;
}


export default {
    createProjectService,
    updateProjectService,
    createListService,
    updateListService,
    createTaskService,
    updateTaskService,
    deleteTaskService,
    updateProjectMemberService,
    getProjectWithInfoService,
    assignTaskService,
    unassignTaskService,
    getProjectsByOwnerPaginatedService,
    getProjectsAsColaboratorPaginatedService,
    reorderListsService,
}