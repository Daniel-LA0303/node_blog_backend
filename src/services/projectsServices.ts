import { assign } from "nodemailer/lib/shared";
import { CrateProjectRequestI, CreateListRequestI, CreateProjectTaskRequestI, UpdateListRequestI, UpdateProjectMemberRequestI, UpdateProjectRequestI, UpdateProjectTaskRequestI } from "../interfaces/projects.interfaces";
import { ProjectList } from "../models/ProjectList";
import { Project } from "../models/Projects";
import { ProjectTask } from "../models/ProjectTask";
import { ServiceException } from "../utils/exception/ServiceException";
import User from "../models/User";
import { ProjectMember } from "../models/ProjectMember";



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


export default {
    createProjectService,
    updateProjectService,
    createListService,
    updateListService,
    createTaskService,
    updateTaskService,
    deleteTaskService,
    updateProjectMemberService
}