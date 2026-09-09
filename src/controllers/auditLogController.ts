import auditLogServices from "../services/auditLogServices";
import { ApiResponse } from "../utils/ApiResponse";


const getAuditLogInfoController = async (req: any, res: any, next: any) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filters = {
      category: req.query.category || undefined,
      search: req.query.search || undefined,
    };

    const r = await auditLogServices.getAuditLogsPaginatedService(page, limit, filters);

    res.status(200).json(
      new ApiResponse(200, "/api" + req.path, req.method, "", r, false)
    );
  } catch (error) {
    next(error);
  }
}

export default {
    getAuditLogInfoController
}