import express from "express";
import checkRoleAuth from "../middleware/checkRoleAuth";
import listsController from "../controllers/listsController";
import checkAuth from "../middleware/checkAuth";


const router = express.Router();

router.post(
    '/create-study-list',
    checkAuth,
    listsController.createStudyListController
);

router.put(
    '/update-study-list/:listId',
    checkAuth,
    listsController.updateStudyListController
);

router.delete(
    '/delete-study-list/:listId',
    checkAuth,
    listsController.deleteStudyListController
);

router.post(
    '/study-lists/:listId/items',
    checkAuth,
    listsController.addStudyListItemController
);

router.put(
    '/study-lists/:listId/items/:itemId',
    checkAuth,
    listsController.updateStudyListItemController
);

router.delete(
    '/study-lists/:listId/items/:itemId',
    checkAuth,
    listsController.deleteStudyListItemController
);

router.get(
    '/study-lists-by-owner',
    checkAuth,
    listsController.getStudyListsController
);

router.get(
    '/study-lists/:listId/items',
    checkAuth,
    listsController.getStudyListItemsController
);

router.get('/study-lists/resource-membership', 
    checkAuth, 
    listsController.getResourceListMembershipController);


router.get(
    "/study-lists/:listId",
    listsController.getStudyListController
);

router.patch(
    '/study-lists/:listId/items/reorder', 
    checkAuth, 
    listsController.reorderStudyListItemsController
);


export default router;