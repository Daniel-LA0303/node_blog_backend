import { LogInput } from "../interfaces/auditlog.interfaces";
import { AuditLog } from "../models/AuditLog";
import notificationsServices from "./notificationsServices";

const createAuditLogService = async ({
    actor,
    action,
    category,
    target,
    req
}: LogInput) => {

    const formattedRoles: string[] = actor.roles.map((r: any) =>
        typeof r === 'string' ? r : r.name
    );
    const newLog = await AuditLog.create({
        actor: {
            user: actor._id,
            name: actor.name,
            email: actor.email,
            roles: formattedRoles
        },
        action,
        category,
        target,
        ipAddress: req?.ip || req?.headers['x-forwarded-for']
    });

    if (category === 'MODERATION') {
        await notificationsServices.sendNotificationNewActionModerLogService(actor._id, newLog);
    }
}

interface LogsReportFilters {
    category?: string;
    search?: string;
}


const getAuditLogsPaginatedService = async (
    page: number,
    limit: number,
    filters: LogsReportFilters = {}
) => {
    const skip = (page - 1) * limit;

    const match: Record<string, any> = {};

    if (filters.category) {
        match['category'] = filters.category;
    }

    if (filters.search) {
        const re = new RegExp(filters.search, 'i');
        match.$or = [
            { 'actor.name': re },
            { 'actor.email': re },
        ];
    }

    const pipeline: any[] = [];

    if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'actor.user',
                        foreignField: '_id',
                        as: 'actorInfo',
                        pipeline: [
                            { $project: { profilePicture: 1 } },
                        ],
                    },
                },
                {
                    $addFields: {
                        'actor.profilePicture': {
                            $arrayElemAt: ['$actorInfo.profilePicture', 0],
                        },
                    },
                },
                {
                    $project: {
                        actorInfo: 0, // ya extraído en actor.profilePicture, no lo necesitamos duplicado
                        updatedAt: 0,
                    },
                },
            ],
            totalCount: [{ $count: 'count' }],
        },
    });

    const result = await AuditLog.aggregate(pipeline);

    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount[0]?.count ?? 0;

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export default {
    createAuditLogService,
    getAuditLogsPaginatedService
}