import { ICreateBadge, IUpdateBadge } from "../interfaces/badges.interfaces";
import { Badge } from "../models/Badge";
import User from "../models/User";
import { ServiceException } from "../utils/exception/ServiceException";


const createBadgeService = async (dto: ICreateBadge) => {

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

    return newBadge;
};

const getBadgesPaginatedService = async (
    page = 1,
    limit = 10
) => {

    const skip = (page - 1) * limit;

    const badges = await Badge.find({
        //status: { $ne: 'DELETED' }
    })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Badge.countDocuments({
        //status: { $ne: 'DELETED' }
    });

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
    dto: IUpdateBadge
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

    return badge;
};

const deleteBadgeService = async (badgeId: string) => {

    const badge = await Badge.findById(badgeId);

    if (!badge) {
        throw new ServiceException('This badge does not exist.',404);
    }

    if (badge.status === 'DELETED') {
        throw new ServiceException('This badge is already deleted.',400);
    }

    badge.status = 'DELETED';

    await badge.save();

    return 'Badge deleted successfully';
};


export default {
    createBadgeService,
    getBadgesPaginatedService,
    updateBadgeService,
    deleteBadgeService
}