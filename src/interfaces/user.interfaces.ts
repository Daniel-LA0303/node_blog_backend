import { Types } from "mongoose";

interface IProfilePicture {
    secure_url: string;
    public_id: string;
}

interface ISocial {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    linkedin: string;
}

interface IInfo {
    desc: string;
    work: string;
    education: string;
    skills: string[];
    social: ISocial;
}

interface ILikePost {
    reactions: number;
    posts: Types.ObjectId[];
}

interface IPostsSaved {
    saved: number;
    posts: Types.ObjectId[];
}

interface IFollowsTags {
    countTags: number;
    tags: Types.ObjectId[];
}

interface IFollowersUsers {
    conutFollowers: number;
    followers: Types.ObjectId[];
}

interface IFollowedUsers {
    conutFollowed: number;
    followed: Types.ObjectId[];
}

interface INotification {
    user: Types.ObjectId;
    notification: string;
    type: string;
    date: Date;
}

export interface IUser extends Document {

    name: string;

    password: string;

    email: string;

    token?: string;

    confirm: boolean;

    profilePicture: IProfilePicture;

    numberPost: number;

    info: IInfo;

    likePost: ILikePost;

    postsSaved: IPostsSaved;

    followsTags: IFollowsTags;

    followersUsers: IFollowersUsers;

    followedUsers: IFollowedUsers;

    posts: Types.ObjectId[];

    notifications: INotification[];

    checkPassword(passwordForm: string): Promise<boolean>;
}
