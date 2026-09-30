import express from "express";
import checkAuth from "../middleware/checkAuth";
import projectController from "../controllers/projectController";


const router = express.Router();

router.get('/get-project/:id',
    checkAuth,
    projectController.getProjectWithInfoController);

router.post('/create-project',
    checkAuth,
    projectController.createProjectController);

router.put('/update-project/:id',
    checkAuth,
    projectController.updateProjectController);

router.post('/list/create-list',
    checkAuth,
    projectController.createListController);

router.put('/list/update-list/:id',
    checkAuth,
    projectController.updateListController);

router.post('/task/create-task',
    checkAuth,
    projectController.createTaskController);

router.put('/task/update-task/:id',
    checkAuth,
    projectController.updateTaskController);

router.delete('/task/delete-task/:id',
    checkAuth,
    projectController.deleteTaskController);

router.post('/user',
    checkAuth,
    projectController.userInToProjectController);

router.patch('/assign-task/:id',
    checkAuth,
    projectController.assignTaskController);

router.patch('/unassign-task/:id',
    checkAuth,
    projectController.unassignTaskController);

router.get('/get-projects-by-owner/:id',
    checkAuth,
    projectController.getProjectsByOwnerPaginatedController);

router.get('/projects-as-collaborator/:id', 
    checkAuth, 
    projectController.getProjectsAsColaboratorController);

export default router