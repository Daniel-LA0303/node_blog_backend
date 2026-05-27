import { ApiResponse } from "../utils/ApiResponse";

import notificationsService from '../services/notificationsServices';


const getNotificationsByUserController = async (req: any, res: any, next: any) => {
    try {
    
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            const userId = req.params.id; 
    
            const result = await notificationsService.getNotificationsByUserService(page, limit, userId);
    
            // mapping response
            res.status(200).json(
                new ApiResponse(200, "/api/notifications/:id" + req.path, req.method, "Success get posts by user paginated", result, false)
            );
    
        } catch (error) {
            console.log(error);
            next(error);
        }
    
}

export {
    getNotificationsByUserController
}