import { ICreateReport, INewStatusReport } from "../interfaces/reports.interfaces";
import reportsServices from "../services/reportsServices";
import { ApiResponse } from "../utils/ApiResponse";


const createReportController = async (req: any, res: any, next: any) => {

    try {

        const r = await reportsServices.createNewReport(req.body as ICreateReport);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                r,
                null,
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const getUsersPaginatedWithReportsInfoController = async (req: any, res: any, next: any) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters = {
      role: req.query.role || undefined,
      status: req.query.status || undefined,
      search: req.query.search || undefined,
    };

    const r = await reportsServices.getUsersPaginatedWithReportsInfoService(page, limit, filters);

    res.status(200).json(
      new ApiResponse(200, "/api" + req.path, req.method, "", r, false)
    );
  } catch (error) {
    next(error);
  }
}

const getCategoriesPaginatedInfoController = async (req: any, res: any, next: any) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters = {
      search: req.query.search || undefined,
    };


    const r = await reportsServices.getCategoriesPaginatedInfoService(page, limit, filters);

    res.status(200).json(
      new ApiResponse(200, "/api" + req.path, req.method, "", r, false)
    );
  } catch (error) {
    next(error);
  }
}

const getPostsPaginatedWithReportsInfoController = async (req: any, res: any, next: any) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters = {
      status: req.query.status || undefined,
      search: req.query.search || undefined,
    };

    const r = await reportsServices.getPostPaginatedWithReportsInfoService(page, limit, filters);

    res.status(200).json(
      new ApiResponse(200, "/api" + req.path, req.method, "", r, false)
    );
  } catch (error) {
    next(error);
  }
}

const changeStatusController = async (req: any, res: any, next: any) => {

    try {
        await reportsServices.newStatuReportService(req.body as INewStatusReport);
        
        // call service to confirm
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Report status changed successfully",
                "Report status changed successfully",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}


export default {
    createReportController,
    getUsersPaginatedWithReportsInfoController,
    getCategoriesPaginatedInfoController,
    getPostsPaginatedWithReportsInfoController,
    changeStatusController
}