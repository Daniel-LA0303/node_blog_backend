import express from "express";
import checkAuth from "../middleware/checkAuth";
import projectController from "../controllers/projectController";


const router = express.Router();

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

export default router