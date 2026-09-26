import mongoose from "mongoose";

export interface IStudyList extends Document{
  _id?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudyListItem extends Document{
  _id?: mongoose.Types.ObjectId;

  listId: mongoose.Types.ObjectId;

  resourceType: 'POST' | 'QUIZ';

  resourceId: mongoose.Types.ObjectId;

  order: number;

  createdAt: Date;
  updatedAt: Date;
}