import StudyListItem from "../models/StudyListItem";
import StudyList from "../models/StudyListSchema";
import { ServiceException } from "../utils/exception/ServiceException";
import mongoose from "mongoose"
import badgesServices from "./badgesServices";


const createStudyListService = async (
    owner: string,
    title: string,
    description?: string
) => {

    const studyList = new StudyList({
        owner,
        title,
        description,
        status: 'ACTIVE'
    });

    const result = await studyList.save();

    await badgesServices.checkAndAwardBadges(owner, 'LIST_COUNT')
        .catch(err => console.error('[badges] error', err));

    return result;
};

const updateStudyListService = async (
    listId: string,
    owner: string,
    title: string,
    status: 'ACTIVE' | 'HIDDEN' | 'DELETED',
    description?: string,
) => {

    const studyList = await StudyList.findOne({
        _id: listId,
        owner
    });

    if (!studyList) {
        throw new ServiceException("This study lits does not exists.", 404);
    }

    studyList.title = title;
    studyList.description = description;
    studyList.status = status;

    const result = await studyList.save();

    return result;
};

const deleteStudyListService = async (
    listId: string,
    owner: string
) => {


    const studyList = await StudyList.findOne({
        _id: listId,
        owner
    });

    if (!studyList) {
        throw new ServiceException("This study lists does not exists.", 404);
    }

    studyList.status = 'DELETED';

    const result = await studyList.save();

    return result;
};

const addStudyListItemService = async (
    listId: string,
    owner: string,
    resourceType: 'POST' | 'QUIZ',
    resourceId: string
) => {

    const studyList = await StudyList.findOne({
        _id: listId,
        owner,
        status: { $ne: 'DELETED' }
    });

    if (!studyList) {
        throw new ServiceException("This study list does not exists.", 404);
    }

    const existingItem = await StudyListItem.findOne({
        listId,
        resourceType,
        resourceId
    });

    if (existingItem) {
        throw new ServiceException("This study lists item already exists in this list.", 404);
    }

    const lastItem = await StudyListItem
        .findOne({ listId })
        .sort({ order: -1 });

    const order = lastItem
        ? lastItem.order + 1
        : 1;

    const studyListItem = new StudyListItem({
        listId,
        resourceType,
        resourceId,
        order
    });

    const result = await studyListItem.save();

    return result;
};

const updateStudyListItemService = async (
    listId: string,
    itemId: string,
    owner: string,
    order: number
) => {

    const studyList = await StudyList.findOne({
        _id: listId,
        owner,
        status: { $ne: 'DELETED' }
    });

    if (!studyList) {
        throw new ServiceException("This study lists does not exists.", 404);
    }

    const studyListItem = await StudyListItem.findOne({
        _id: itemId,
        listId
    });

    if (!studyListItem) {
        throw new ServiceException("This study lists item does not exists.", 404);
    }

    studyListItem.order = order;

    const result = await studyListItem.save();

    return result;
};

const deleteStudyListItemService = async (
    listId: string,
    itemId: string,
    owner: string
) => {

    const studyList = await StudyList.findOne({
        _id: listId,
        owner,
        status: { $ne: 'DELETED' }
    });

    if (!studyList) {
        throw new ServiceException("This study lists does not exists.", 404);
    }

    const studyListItem = await StudyListItem.findOneAndDelete({
        _id: itemId,
        listId
    });

    if (!studyListItem) {
        throw new ServiceException("This study lists item does not exists.", 404);
    }

    return studyListItem;
};

const getStudyListsPaginatedService = async (
    owner: string,
    page: number,
    limit: number
) => {

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        StudyList.find({
            owner,
            status: { $ne: 'DELETED' }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        StudyList.countDocuments({
            owner,
            status: { $ne: 'DELETED' }
        })
    ]);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getStudyListItemsPaginatedService = async (
    listId: string,
    owner: string,
    page: number,
    limit: number
) => {

    const skip = (page - 1) * limit;

    const studyList = await StudyList.findOne({
        _id: listId,
        // owner,
        status: { $ne: 'DELETED' }
    });

    if (!studyList) {
        throw new ServiceException("This study lists does not exists.", 404);
    }

    const [data, total] = await Promise.all([

        StudyListItem.aggregate([
            {
                $match: {
                    listId: studyList._id
                }
            },

            {
                $sort: {
                    order: 1
                }
            },

            {
                $skip: skip
            },

            {
                $limit: limit
            },

            // search Post
            {
                $lookup: {
                    from: 'posts',
                    let: {
                        resourceId: '$resourceId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$resourceId']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                typePost: 1,
                                status: 1
                            }
                        }
                    ],
                    as: 'post'
                }
            },

            // search quiz Quiz
            {
                $lookup: {
                    from: 'quizzes',
                    let: {
                        resourceId: '$resourceId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$resourceId']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                questionCount: 1,
                                status: 1
                            }
                        }
                    ],
                    as: 'quiz'
                }
            },
            // get post or quiz depends of condition
            {
                $addFields: {
                    resource: {
                        $cond: [
                            {
                                $eq: ['$resourceType', 'POST'] // condition
                            },
                            {
                                $arrayElemAt: ['$post', 0]
                            },
                            {
                                $arrayElemAt: ['$quiz', 0]
                            }
                        ]
                    }
                }
            },

            {
                $project: {
                    post: 0,
                    quiz: 0
                }
            }
        ]),

        StudyListItem.countDocuments({
            listId: studyList._id
        })
    ]);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getStudyListService = async (
    listId: string,
) => {

    const studyList = await StudyList.findOne({
        _id: listId,
        status: { $ne: 'DELETED' }
    });

    if (!studyList) {
        throw new ServiceException(
            "This study list does not exist.",
            404
        );
    }

    return studyList;
};

const reorderStudyListItemsService = async (
    listId: string,
    userId: string,
    items: { _id: string; order: number }[]
) => {

    // 1. basic payload validation
    if (!Array.isArray(items) || items.length === 0) {
        throw new ServiceException("Items are required.", 400);
    }

    const ids = items.map((i) => String(i._id));
    const orders = items.map((i) => i.order);

    if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
        throw new ServiceException("Invalid item id.", 400);
    }

    if (orders.some((o) => !Number.isInteger(o) || o < 0)) {
        throw new ServiceException("Order must be a non-negative integer.", 400);
    }

    // no repeated ids or repeated orders
    if (new Set(ids).size !== ids.length || new Set(orders).size !== orders.length) {
        throw new ServiceException("Repeated ids or orders are not allowed.", 400);
    }

    // 2. the list must exist
    const studyList = await StudyList.findOne({
        _id: listId,
        status: { $ne: 'DELETED' }
    });

    if (!studyList) {
        throw new ServiceException("This study list does not exist.", 404);
    }

    // 3. only the owner can reorder (the front hides the drag, but we check here too)
    if (studyList.owner.toString() !== userId) {
        throw new ServiceException("You are not allowed to reorder this list.", 403);
    }

    // 4. every item must belong to this list
    const count = await StudyListItem.countDocuments({
        _id: { $in: ids },
        listId
    });

    if (count !== ids.length) {
        throw new ServiceException("Some items do not belong to this list.", 400);
    }

    // 5. apply all the new orders concurrently
    await Promise.all(
        items.map((i) =>
            StudyListItem.updateOne(
                { _id: i._id, listId },
                { $set: { order: i.order } }
            )
        )
    );

    return items;
};

// servitce to reorder OUR LIST
/*const reorderStudyListItemsService = async (
    listId: string,
    userId: string,
    items: { _id: string; order: number }[]
) => {

    // 1. basic payload validation
    if (!Array.isArray(items) || items.length === 0) {
        throw new ServiceException("Items are required.", 400);
    }

    const ids = items.map((i) => String(i._id));
    const orders = items.map((i) => i.order);

    if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
        throw new ServiceException("Invalid item id.", 400);
    }

    if (orders.some((o) => !Number.isInteger(o) || o < 0)) {
        throw new ServiceException("Order must be a non-negative integer.", 400);
    }

    // no repeated ids or repeated orders
    if (new Set(ids).size !== ids.length || new Set(orders).size !== orders.length) {
        throw new ServiceException("Repeated ids or orders are not allowed.", 400);
    }

    // 2. the list must exist
    const studyList = await StudyList.findOne({
        _id: listId,
        status: { $ne: 'DELETED' }
    });

    if (!studyList) {
        throw new ServiceException("This study list does not exist.", 404);
    }

    // 3. only the owner can reorder (the front hides the drag, but we check here too)
    if (studyList.owner.toString() !== userId) {
        throw new ServiceException("You are not allowed to reorder this list.", 403);
    }

    // 4. every item must belong to this list
    const count = await StudyListItem.countDocuments({
        _id: { $in: ids },
        listId
    });

    if (count !== ids.length) {
        throw new ServiceException("Some items do not belong to this list.", 400);
    }

    // 5. apply all the new orders in one round trip
    await StudyListItem.bulkWrite(
        items.map((i) => ({
            updateOne: {
                filter: { _id: i._id, listId },
                update: { $set: { order: i.order } }
            }
        }))
    );

    return items;
};**/

// to get resources
const getResourceListMembershipService = async (
    owner: string,
    resourceType: 'POST' | 'QUIZ',
    resourceId: string
) => {

    // busca TODOS los items con ese recurso, sin importar la lista...
    const items = await StudyListItem.find({ resourceType, resourceId })
        // ...y aquí filtramos a que la lista sea del usuario. Si no matchea,
        // populate deja "listId" en null en vez de tronar
        .populate({ path: 'listId', match: { owner, status: { $ne: 'DELETED' } }, select: '_id' });

    return items
        .filter((item: any) => item.listId) // descarta las que no son del usuario
        .map((item: any) => ({
            listId: item.listId._id.toString(),
            itemId: item._id.toString(), // lo necesitas para poder quitarlo después
        }));
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getGlobalStudyListsPaginatedService = async (
    userId: string,
    page: number,
    limit: number,
    search?: string,
    mine?: boolean
) => {

    const skip = (page - 1) * limit;

    const filter: any = mine
        ? { owner: userId, status: { $ne: 'DELETED' } }
        : {
            $or: [
                { owner: userId, status: { $ne: 'DELETED' } },
                { owner: { $ne: userId }, status: 'ACTIVE' }
            ]
        };

    if (search) {
        filter.title = { $regex: escapeRegex(search), $options: 'i' };
    }

    const [data, total] = await Promise.all([
        StudyList.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        StudyList.countDocuments(filter)
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};


export default {
    createStudyListService,
    updateStudyListService,
    deleteStudyListService,
    addStudyListItemService,
    updateStudyListItemService,
    deleteStudyListItemService,
    getStudyListsPaginatedService,
    getStudyListItemsPaginatedService,
    getStudyListService,
    reorderStudyListItemsService,
    getResourceListMembershipService,
    getGlobalStudyListsPaginatedService,
};