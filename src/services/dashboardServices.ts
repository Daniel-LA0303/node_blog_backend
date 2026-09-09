import { CategoryMetricResult, EngagementStatsResult } from "../interfaces/dahsboard.interfaces";
import { AuditLog } from "../models/AuditLog";
import Categories from "../models/Categories";
import Comment from "../models/Comments";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import Notification from "../models/Notification";
import Post from "../models/Post";
import Reply from "../models/Replies";
import Reports from "../models/Reports";
import User from "../models/User"

interface StatusAggregate {
    _id: string;
    count: number;
}

const getAllCountDocumentsService = async () => {

    // 1. get info 
    let data: any = {};
    data.countUsers = await User.countDocuments();
    data.countPosts = await Post.countDocuments();
    data.countCategories = await Categories.countDocuments();
    data.countComments = await Comment.countDocuments();
    data.countReports = await Reports.countDocuments();
    data.countConversations = await Conversation.countDocuments();
    data.countNotifications = await Notification.countDocuments();

    return data;
}

const getCountPostsByStatusService = async (startDate: string, endDate: string) => {

    const TargetStatuses = ['PUBLISHED', 'HIDDEN', 'DELETED'] as const;

    /**
     * Converts MM-DD-YYYY to UTC Date.
     *
     * Example:
     * 09-01-2026 -> 2026-09-01T00:00:00.000Z
     * 09-30-2026 -> 2026-09-30T23:59:59.999Z
     */
    const parseToUtcDate = (dateStr: string, isEndOfDay = false): Date => {
        const [month, day, year] = dateStr.split('-').map(Number);

        if (!month || !day || !year || year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) {
            throw new Error(`Invalid date format: ${dateStr}. Expected MM-DD-YYYY`);
        }

        return new Date(
            Date.UTC(
                year,
                month - 1,
                day,
                isEndOfDay ? 23 : 0,
                isEndOfDay ? 59 : 0,
                isEndOfDay ? 59 : 0,
                isEndOfDay ? 999 : 0
            )
        );
    };

    // 1. Parse dates (MM-DD-YYYY format)
    const start = parseToUtcDate(startDate);
    const end = parseToUtcDate(endDate, true);

    // 2. Aggregate counts
    const aggregation = await Post.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                status: { $in: TargetStatuses },
            },
        },
        {
            $facet: {
                total: [{ $count: 'count' }],
                byStatus: [
                    { $group: { _id: '$status', count: { $sum: 1 } } },
                ],
            },
        },
    ]);

    // Explicitly type rawTotal as a number
    const rawTotal: number = aggregation[0]?.total[0]?.count || 0;
    const rawData: StatusAggregate[] = aggregation[0]?.byStatus || [];

    // Map database results with explicit type definitions
    const statusMap = new Map<string, number>(
        rawData.map((item: StatusAggregate) => [item._id, item.count])
    );

    // 3. Construct response safely
    const data = TargetStatuses.map((status) => {
        const count: number = statusMap.get(status) || 0;
        const percentage: number = rawTotal > 0 ? Number(((count / rawTotal) * 100).toFixed(2)) : 0;
        return { status, count, percentage };
    });

    return {
        range: { startDate, endDate },
        total: rawTotal,
        data,
    };
};

const getTopModeratorsService = async () => {

    // 1. Static Aggregation Pipeline
    const rawTopUsers = await AuditLog.aggregate([
        // Step A: Group by actor.user to count total actions
        {
            $group: {
                _id: '$actor.user',
                name: { $first: '$actor.name' },
                email: { $first: '$actor.email' },
                actionsCount: { $sum: 1 },
            },
        },
        // Step B: Sort descending by action count
        { $sort: { actionsCount: -1 } },
        // Step C: Limit to top 5 users
        { $limit: 5 },
        // Step D: Join with the users collection for profilePicture
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userData',
            },
        },
        // Step E: Flatten the joined user array
        {
            $unwind: {
                path: '$userData',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]);

    if (rawTopUsers.length === 0) {
        return [];
    }

    // 2. Highest action count (Top 1) sets the 100% benchmark
    const maxActionsCount: number = rawTopUsers[0].actionsCount;

    // 3. Format result and calculate percentage relative to #1 user
    return rawTopUsers.map((actor: any) => {
        const actionsCount: number = actor.actionsCount;
        const percentage: number = maxActionsCount > 0
            ? Number(((actionsCount / maxActionsCount) * 100).toFixed(2))
            : 0;

        return {
            userId: actor._id.toString(),
            name: actor.name,
            email: actor.email,
            profilePicture: actor.userData?.profilePicture || {
                secure_url: '',
                public_id: '',
            },
            actionsCount,
            percentage,
        };
    });
}

const getRecentLogsInfoService = async () => {

    // 1. get info 
    const data = AuditLog.find()
        .sort({ createdAt: -1 })
        .select("-__v -updatedAt -ipAddress")
        .limit(5);

    return data;
}


const getTop5CategoriesByFollowsService = async (): Promise<CategoryMetricResult[]> => {
    const categories = await Categories.find({})
        .sort({ 'follows.countFollows': -1 })
        .limit(5)
        .select('name label color follows.countFollows')
        .lean();

    if (categories.length === 0) return [];

    // Sum of all counts across the top 5
    const sumTotalCounts: number = categories.reduce(
        (acc: any, cat: any) => acc + (cat.follows?.countFollows || 0),
        0
    );

    return categories.map((cat: any) => {
        const count: number = cat.follows?.countFollows || 0;
        const percentage: number = sumTotalCounts > 0
            ? Number(((count / sumTotalCounts) * 100).toFixed(2))
            : 0;

        return {
            categoryId: cat._id.toString(),
            name: cat.name,
            label: cat.label,
            color: cat.color ?? '',
            count,
            percentage,
        };
    });
};

const getTop5CategoriesByDateRangeService = async (
    startDate: string,
    endDate: string
): Promise<CategoryMetricResult[]> => {
    const [startMonth, startDay, startYear] = startDate.split('-').map(Number);
    const [endMonth, endDay, endYear] = endDate.split('-').map(Number);

    const start = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0));
    const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));

    const rawTopCategories = await Post.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
            },
        },
        { $unwind: '$categories' },
        {
            $group: {
                _id: '$categories',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails',
            },
        },
        {
            $unwind: {
                path: '$categoryDetails',
                preserveNullAndEmptyArrays: false,
            },
        },
    ]);

    if (rawTopCategories.length === 0) return [];

    // Sum of all counts across the top 5
    const sumTotalCounts: number = rawTopCategories.reduce(
        (acc, item) => acc + item.count,
        0
    );

    return rawTopCategories.map((item: any) => {
        const count: number = item.count;
        const percentage: number = sumTotalCounts > 0
            ? Number(((count / sumTotalCounts) * 100).toFixed(2))
            : 0;

        return {
            categoryId: item._id.toString(),
            name: item.categoryDetails.name,
            label: item.categoryDetails.label,
            color: item.categoryDetails.color ?? '',
            count,
            percentage,
        };
    });
};


const getEngagementStatsByDateRangeService = async (
    startDate: string,
    endDate: string
): Promise<EngagementStatsResult> => {

    const parseToUtcDate = (
        dateStr: string,
        isEndOfDay = false
    ): Date => {
        const [month, day, year] = dateStr.split("-").map(Number);
        // Basic validation
        if (!day || !month || !year || year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) {
            throw new Error(`Invalid date format: ${dateStr}. Expected MM-DD-YYYY`);
        }
        const date = new Date(
            Date.UTC(
                year,
                month - 1,
                day,
                isEndOfDay ? 23 : 0,
                isEndOfDay ? 59 : 0,
                isEndOfDay ? 59 : 0,
                isEndOfDay ? 999 : 0
            )
        );
        return date;
    };
    const start = parseToUtcDate(startDate);
    const end = parseToUtcDate(endDate, true);
    const [
        commentsTotal,
        repliesTotal,
        messagesTotal,
        notificationsTotal,
    ] = await Promise.all([
        Comment.countDocuments({
            dateComment: {
                $gte: start,
                $lte: end,
            },
        }),
        Reply.countDocuments({
            dateReply: {
                $gte: start,
                $lte: end,
            },
        }),
        Message.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }),
        Notification.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }),
    ]);
    return {
        range: {
            startDate,
            endDate,
        },
        commentsTotal,
        repliesTotal,
        messagesTotal,
        notificationsTotal,
    };
};

const getCountReportsByStatusService = async (
    startDate: string,
    endDate: string
) => {
        const ReportStatuses = [
        'PENDING',
        'RESOLVED',
        'DISMISSED',
    ] as const;

    // MM-DD-YYYY
    const [startMonth, startDay, startYear] = startDate
        .split('-')
        .map(Number);

    const [endMonth, endDay, endYear] = endDate
        .split('-')
        .map(Number);

    const start = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));

    const end = new Date(Date.UTC(endYear,endMonth - 1,endDay,23,59,59,999));

    const aggregation = await Reports.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: start,
                    $lte: end,
                },
                status: {
                    $in: ReportStatuses,
                },
            },
        },
        {
            $group: {
                _id: '$status',
                count: {
                    $sum: 1,
                },
            },
        },
    ]);

    // Total de reportes dentro del rango
    const total = aggregation.reduce(
        (sum, item) => sum + item.count,
        0
    );

    // Convert aggregation result into a Map
    const statusMap = new Map<string, number>(
        aggregation.map((item) => [
            item._id,
            item.count,
        ])
    );

    // Always return all statuses, even if count = 0
    const data = ReportStatuses.map((status) => {
        const count = statusMap.get(status) || 0;

        const percentage =
            total > 0
                ? Math.round((count / total) * 100)
                : 0;

        return {
            status,
            count,
            percentage,
        };
    });

    return {
        range: {
            startDate,
            endDate,
        },
        total,
        data,
    };
};

const getMessagesLast7DaysService = async () => {
    const today = new Date();

    // Start = 6 days ago at 00:00:00.000 UTC
    const startDate = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate() - 6,0,0,0,0));

    // End = today at 23:59:59.999 UTC
    const endDate = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),23,59,59,999));

    const aggregation = await Message.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: "UTC",
                    },
                },
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
    ]);

    const countMap = new Map<string, number>(
        aggregation.map((item) => [
            item._id,
            item.count,
        ])
    );

    const data = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate() - (6 - i),0,0,0,0));

        const key = date.toISOString().split("T")[0];

        const formattedDate = `${String(
            date.getUTCMonth() + 1
        ).padStart(2, "0")}-${String(
            date.getUTCDate()
        ).padStart(2, "0")}-${date.getUTCFullYear()}`;

        data.push({
            date: formattedDate,
            count: countMap.get(key) || 0,
        });
    }

    return {
        data,
    };
};

const getNotificationsLast7DaysService = async () => {
    const NotificationTypes = [
        "COMMENT_POST",
        "REPLY_COMMENT",
        "LIKE_POST",
        "FOLLOW_USER",
    ] as const;

    const today = new Date();

    const startDate = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate() - 6,0,0,0,0));

    const endDate = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),23,59,59,999));

    const aggregation = await Notification.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
                type: {
                    $in: NotificationTypes,
                },
            },
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "UTC",
                        },
                    },
                    type: "$type",
                },
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $sort: {
                "_id.date": 1,
            },
        },
    ]);

    const countMap = new Map<string, number>();

    aggregation.forEach((item) => {
        countMap.set(
            `${item._id.date}_${item._id.type}`,
            item.count
        );
    });

    const data = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate() - (6 - i),0,0,0,0));

        const key = date.toISOString().split("T")[0];

        const formattedDate = `${String(
            date.getUTCMonth() + 1
        ).padStart(2, "0")}-${String(
            date.getUTCDate()
        ).padStart(2, "0")}-${date.getUTCFullYear()}`;

        const dayData: Record<string, string | number> = {
            date: formattedDate,
        };

        NotificationTypes.forEach((type) => {
            dayData[type] =
                countMap.get(`${key}_${type}`) || 0;
        });

        data.push(dayData);
    }

    return {
        data,
    };
};



const getUsersByStatusDateRangeService = async (
    startDateString: string,
    endDateString: string
) => {
    
    const UserStatuses = [
        "ACTIVE",
        "BANNED",
        "TO_CONFIRM",
    ] as const;

    // MM-DD-YYYY
    const [startMonth, startDay, startYear] = startDateString
        .split("-")
        .map(Number);

    const [endMonth, endDay, endYear] = endDateString
        .split("-")
        .map(Number);

    const startDate = new Date(Date.UTC(startYear,startMonth - 1,startDay,0,0,0,0));

    const endDate = new Date(Date.UTC(endYear,endMonth - 1,endDay,23,59,59,999));

    const aggregation = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
                status: {
                    $in: UserStatuses,
                },
            },
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "UTC",
                        },
                    },
                    status: "$status",
                },
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $sort: {
                "_id.date": 1,
            },
        },
    ]);

    const countsMap = new Map<string, number>();

    for (const item of aggregation) {
        const key = `${item._id.date}_${item._id.status}`;

        countsMap.set(key, item.count);
    }

    const data = [];

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const year = currentDate.getUTCFullYear();
        const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getUTCDate()).padStart(2, "0");

        const dateKey = `${year}-${month}-${day}`;

        data.push({
            date: `${month}-${day}-${year}`,

            ACTIVE:
                countsMap.get(`${dateKey}_ACTIVE`) ?? 0,

            BANNED:
                countsMap.get(`${dateKey}_BANNED`) ?? 0,

            TO_CONFIRM:
                countsMap.get(`${dateKey}_TO_CONFIRM`) ?? 0,
        });

        currentDate.setUTCDate(
            currentDate.getUTCDate() + 1
        );
    }

    return {
        data,
    };
};

const getModerationActionsByDateRangeService = async (
  startDateString: string,
  endDateString: string
) => {
  // MM-DD-YYYY
  const [startMonth, startDay, startYear] = startDateString
    .split("-")
    .map(Number);
  const [endMonth, endDay, endYear] = endDateString
    .split("-")
    .map(Number);
  const startDate = new Date(Date.UTC(startYear,startMonth - 1,startDay,0,0,0,0));
  const endDate = new Date(Date.UTC(endYear,endMonth - 1,endDay,23,59,59,999));
  const aggregation = await AuditLog.aggregate([
    {
      $match: {
        category: "MODERATION",
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "UTC",
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);
  // Guardamos los resultados por fecha
  const countsMap = new Map<string, number>();
  for (const item of aggregation) {
    countsMap.set(item._id, item.count);
  }
  const data: {
    date: string;
    count: number;
  }[] = [];
  const currentDate = new Date(startDate);
  // Generamos TODOS los días del rango
  while (currentDate <= endDate) {
    const year = currentDate.getUTCFullYear();
    const month = String(
      currentDate.getUTCMonth() + 1
    ).padStart(2, "0");
    const day = String(
      currentDate.getUTCDate()
    ).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    data.push({
      date: `${month}-${day}-${year}`,
      count: countsMap.get(dateKey) ?? 0,
    });
    currentDate.setUTCDate(
      currentDate.getUTCDate() + 1
    );
  }
  return {
    data,
  };
};

export default {
    getAllCountDocumentsService,
    getCountPostsByStatusService,
    getTopModeratorsService,
    getRecentLogsInfoService,
    getTop5CategoriesByFollowsService,
    getTop5CategoriesByDateRangeService,
    getEngagementStatsByDateRangeService,
    getCountReportsByStatusService,
    getMessagesLast7DaysService,
    getNotificationsLast7DaysService,
    getUsersByStatusDateRangeService,
    getModerationActionsByDateRangeService
}