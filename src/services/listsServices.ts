import StudyListItem from "../models/StudyListItem";
import StudyList from "../models/StudyListSchema";
import { ServiceException } from "../utils/exception/ServiceException";


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

    console.log(owner);
    

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
        throw new ServiceException("This study lists does not exists.",404);
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

export default {
    createStudyListService,
    updateStudyListService,
    deleteStudyListService,
    addStudyListItemService,
    updateStudyListItemService,
    deleteStudyListItemService,
    getStudyListsPaginatedService,
    getStudyListItemsPaginatedService,
    getStudyListService
};