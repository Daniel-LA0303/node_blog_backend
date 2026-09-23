import express from "express";
import cors from "cors";
import { app } from "./socketIO/server";

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
import { errorHandler } from "./utils/exception/errorHandler";
import quizRoutes from "./routes/quizRoutes";

app.use(cors());
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
app.use('/api/quiz', quizRoutes);

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