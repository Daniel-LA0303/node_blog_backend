import express from "express";
import cors from "cors";
import { app } from "./socketIO/server";
import { errorHandler } from "./utils/exception/errorHandler";

import usersRoutes from './routes/usersRoutes';
import postsRoutes from './routes/postsRoutes'
import categoriesRoutes from './routes/categoriesRoutes'
import pagesRoutes from './routes/pagesRoutes'
import commentsRoutes from './routes/commentRoutes'
import repliesRoutes from './routes/repliesRoutes'
import messageRoutes from './routes/messageRoutes'
import paymentRoutes from './routes/paymentsRoutes'
import notificationsRoutes from './routes/notificationsRoutes'
import reportsRoutes from './routes/reportsRoutes'
import dashboardRoutes from './routes/dashboardRoutes'
import auditLogRoutes from './routes/auditRoutes'
import badgesRoutes from './routes/badgesRoutes'
import quizRoutes from "./routes/quizRoutes";
import projectRoutes from './routes/projectRoutes'
import listsRoutes from "./routes/listsRoutes"



app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.FRONTEND_URL as string,
    process.env.FRONTEND_URL_WEB as string,
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-socket-id'],
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/replies', repliesRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/bagdes', badgesRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/lists', listsRoutes);



app.get('/api/instance-info', (req, res) => {
  res.json({
    pod: process.env.POD_NAME || 'unknown',
    podIP: process.env.POD_IP || 'unknown',
    node: process.env.NODE_NAME || 'unknown',
    hostname: require('os').hostname(),
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

export default app;