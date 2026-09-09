
export interface TopActorResult {
  userId: string;
  name: string;
  email: string;
  profilePicture: {
    secure_url: string;
    public_id: string;
  };
  actionsCount: number;
  percentage: number;
}

export interface CategoryMetricResult {
  categoryId: string;
  name: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
}

export interface EngagementStatsResult {
  range: {
    startDate: string;
    endDate: string;
  };
  commentsTotal: number;
  repliesTotal: number;
  messagesTotal: number;
  notificationsTotal: number;
}