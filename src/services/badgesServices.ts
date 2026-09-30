import { ICreateBadge, IUpdateBadge } from "../interfaces/badges.interfaces";
import { Badge } from "../models/Badge";
import User from "../models/User";
import { UserBadge } from "../models/UserBadge";
import { ServiceException } from "../utils/exception/ServiceException";
import auditLogServices from "./auditLogServices";


const createBadgeService = async (dto: ICreateBadge, u: any, req: any) => {

    // 1. validate name is not already used
    const existingBadge = await Badge.findOne({
        name: dto.name
    });

    if (existingBadge) {
        throw new ServiceException(
            'A badge with this name already exists.',
            400
        );
    }

    // 2. validate creator exists
    const user = await User.findById(dto.createdBy);

    if (!user) {
        throw new ServiceException(
            'This user does not exist.',
            404
        );
    }

    // 3. build and save
    const newBadge = new Badge({
        name: dto.name,
        description: dto.description,
        img: dto.img,
        condition: dto.condition,
        status: 'ACTIVE',
        createdBy: dto.createdBy
    });

    await newBadge.save();

    await auditLogServices.createAuditLogService({
        actor: u,
        action: 'CREATE_BADGE',
        category: 'MODERATION',
        target: {
            entityType: 'Badge',
            entityId: newBadge._id,
            name: newBadge.name
        },
        req
    });


    return newBadge;
};

interface BadgeReportsFilters {
    status?: string;
    search?: string;
}

const getBadgesPaginatedService = async (
    page: number,
    limit: number,
    filters: BadgeReportsFilters = {}
) => {
    const skip = (page - 1) * limit;

    const match: Record<string, any> = {};

    if (filters.status) {
        match.status = filters.status;
    }

    if (filters.search) {
        const re = new RegExp(filters.search, 'i');
        match.$or = [
            { name: re },
            //{ description: re }
        ];
    }

    const pipeline: any[] = [
        { $sort: { createdAt: -1 } }
    ];

    if (Object.keys(match).length > 0) {
        pipeline.push({
            $match: match
        });
    }

    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit }
            ],
            totalCount: [
                { $count: "count" }
            ]
        }
    });

    const result = await Badge.aggregate(pipeline);

    const badges = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
        data: badges,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateBadgeService = async (
    badgeId: string,
    dto: IUpdateBadge,
    u: any,
    req: any
) => {

    // 1. validate badge exists
    const badge = await Badge.findById(badgeId);

    if (!badge) {
        throw new ServiceException(
            'This badge does not exist.',
            404
        );
    }

    // 2. validate name is not duplicated
    if (dto.name && dto.name !== badge.name) {

        const existingBadge = await Badge.findOne({
            name: dto.name,
            _id: { $ne: badgeId }
        });

        if (existingBadge) {
            throw new ServiceException(
                'A badge with this name already exists.',
                400
            );
        }
    }

    // 3. update fields

    badge.name = dto.name;
    badge.description = dto.description;
    badge.img = dto.img;
    badge.condition = dto.condition;
    badge.status = dto.status;

    // 4. save
    await badge.save();

    await auditLogServices.createAuditLogService({
        actor: u,
        action: 'UPDATE_BADGE',
        category: 'MODERATION',
        target: {
            entityType: 'Badge',
            entityId: badge._id,
            name: badge.name
        },
        req
    });

    return badge;
};

const deleteBadgeService = async (badgeId: string, u: any, req: any) => {

    const badge = await Badge.findById(badgeId);

    if (!badge) {
        throw new ServiceException('This badge does not exist.', 404);
    }

    if (badge.status === 'DELETED') {
        throw new ServiceException('This badge is already deleted.', 400);
    }

    badge.status = 'DELETED';

    await badge.save();

    await auditLogServices.createAuditLogService({
        actor: u,
        action: 'DELETE_BADGE',
        category: 'MODERATION',
        target: {
            entityType: 'Badge',
            entityId: badge._id,
            name: badge.name
        },
        req
    });


    return 'Badge deleted successfully';
};

const getBadgesByUserPaginatedService = async (userId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    // 1. ids of badges that are still visible (not hidden / deleted)
    const visibleBadgeIds = await Badge.distinct('_id', { status: 'ACTIVE' });

    // 2. badges awarded to this user, only visible ones
    const filter = {
        user: userId,
        badge: { $in: visibleBadgeIds }
    };

    const [badges, total] = await Promise.all([
        UserBadge.find(filter)
            .sort({ awardedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('badge', 'name description img icon type condition')
            .lean(),
        UserBadge.countDocuments(filter)
    ]);

    return {
        badges,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};


export default {
    createBadgeService,
    getBadgesPaginatedService,
    updateBadgeService,
    deleteBadgeService,
    getBadgesByUserPaginatedService
}