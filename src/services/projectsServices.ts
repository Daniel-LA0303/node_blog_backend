import { assign } from "nodemailer/lib/shared";
import { CrateProjectRequestI, CreateListRequestI, CreateProjectTaskRequestI, UpdateListRequestI, UpdateProjectMemberRequestI, UpdateProjectRequestI, UpdateProjectTaskRequestI } from "../interfaces/projects.interfaces";
import { ProjectList } from "../models/ProjectList";
import { Project } from "../models/Projects";
import { ProjectTask } from "../models/ProjectTask";
import { ServiceException } from "../utils/exception/ServiceException";
import User from "../models/User";
import { ProjectMember } from "../models/ProjectMember";


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

    return {
        project: {
            ...project.toObject(),
            members: members.map(member => member.user)
        },
        lists: formattedLists,
        tasks: formattedTasks
    };
};

const createProjectService = async (request: CrateProjectRequestI) => {

    // 1. we create project
    const newProject = await Project.create({
        name: request.name,
        description: request.description,
        owner: request.owner
    });


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

    return newTask;
}


const updateTaskService = async (taskId: string, request: UpdateProjectTaskRequestI) => {

    // 1. search task
    const task = await ProjectTask.findById(taskId);
    if (!task) {
        throw new ServiceException("Task not found", 404);
    }

    const project = await Project.findById(task.project);
    if (!project) {
        throw new ServiceException("Project not found", 404);
    }

    const list = await ProjectList.findById(task.list);
    if (!list) {
        throw new ServiceException("List not found", 404);
    }

    task.title = request.title;
    task.description = request.description;
    task.position = request.position;

    const newT = await task.save();

    return newT
}

const deleteTaskService = async (taskId: string) => {

    // 1. search task
    const task = await ProjectTask.findById(taskId);
    if (!task) {
        throw new ServiceException("Task not found", 404);
    }

    await task.remove();
}


const updateProjectMemberService = async (
    request: UpdateProjectMemberRequestI
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

    await projectMember.save();

    return projectMember;
};

const assignTaskService = async (taskId: string, userId: string) => {

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

    return newTask;
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
    unassignTaskService
}