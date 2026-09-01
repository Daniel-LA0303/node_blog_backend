import { ICreateReport } from "../interfaces/reports.interfaces";
import Categories from "../models/Categories";
import Post from "../models/Post";
import Reports from "../models/Reports";
import User from "../models/User";
import { ServiceException } from "../utils/exception/ServiceException";


const createNewReport = async (dto: ICreateReport) => {

    // 1. evit double reports
    const checkReport = await Reports.findOne({
        reportedBy: dto.reportedBy,
        targetId: dto.targetId
    });
    if (checkReport !== null) {
        throw new ServiceException(`This ${dto.targetType} is already report for you.`, 400);
    }

    // 2. valid user want to report exists
    const reporter = await User.findById(dto.reportedBy);

    if (!reporter) {
        throw new ServiceException(`This user does not exists.`, 404);
    }

    // 2. valid exists
    if (dto.targetType === 'User') {
        const user = await User.findById(dto.targetId);

        if (!user) {
            throw new ServiceException(`This user does not exists.`, 404);
        }

    } else {
        const post = await Post.findById(dto.targetId);

        if (!post) {
            throw new ServiceException(`This post does not exists.`, 404);
        }
    }

    // 2. build and save
    const newReport = new Reports(dto);

    await newReport.save();

    return dto.targetType === 'User'
        ? 'Report user addedd successfully'
        : 'Report post addedd successfully';
}

interface UsersReportFilters {
    role?: string;
    status?: string;
    search?: string;
}

const getUsersPaginatedWithReportsInfoService = async (
    page: number,
    limit: number,
    filters: UsersReportFilters = {}
) => {
    const skip = (page - 1) * limit;

    const match: Record<string, any> = {};
    if (filters.role) match['roles.name'] = filters.role;
    if (filters.status) match.status = filters.status;
    if (filters.search) {
        const re = new RegExp(filters.search, 'i');
        match.$or = [{ name: re }, { email: re }];
    }

    const pipeline: any[] = [{ $sort: { createdAt: -1 } }];
    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "reports",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$targetId", "$$userId"] },
                                            { $eq: ["$targetType", "User"] }
                                        ]
                                    }
                                }
                            },
                            { $project: { reason: 1, reportedBy: 1, createdAt: 1, status: 1 } }
                        ],
                        as: "reports"
                    }
                },
                { $addFields: { reportsCount: { $size: "$reports" } } },
                {
                    $project: {
                        password: 0,
                        __v: 0,
                        //numberPost: 0,
                        info: 0,
                        likePost: 0,
                        postsSaved: 0,
                        followsTags: 0,
                        followersUsers: 0,
                        followedUsers: 0,
                        posts: 0,
                        historySearch: 0,
                        recomended: 0,
                        activityTracker: 0,
                        notifications: 0,
                        token: 0,
                        updatedAt: 0
                    }
                }
            ],
            totalCount: [{ $count: "count" }]
        }
    });

    const result = await User.aggregate(pipeline);
    const users = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
        data: users,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

const getCategoriesPaginatedInfoService = async (
    page: number,
    limit: number,
) => {
    const skip = (page - 1) * limit;

    const match: Record<string, any> = {};


    const pipeline: any[] = [{ $sort: { createdAt: -1 } }];
    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
                {
                    $addFields: {
                        followersCount: "$follows.countFollows"
                    }
                },
                {
                    $project: {
                        name: 1,
                        color: 1,
                        desc: 1,
                        longDesc: 1,
                        followersCount: 1,
                        createdAt: 1
                    }
                }
            ],
            totalCount: [{ $count: "count" }]
        }
    });

    const result = await Categories.aggregate(pipeline);
    const cats = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
        data: cats,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};

export default {
    createNewReport,
    getUsersPaginatedWithReportsInfoService,
    getCategoriesPaginatedInfoService
}