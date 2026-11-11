'use strict';
import express, { type Express } from 'express';

require('dotenv').config();

const sql = require('./utils').mysql,
	cookieParser = require('cookie-parser'),
	multer = require('multer'),
	config = require('./module/ad-config'),
	upload = multer({ dest: config.uploadDirectory, fileFilter: config.fileFilter, limits: { fileSize: config.photoSize, files: config.fileCount } }),
	middleWare = require('./module/middleware'),
	server = require('./module/server-engine'),
	userEngine = require('./module/user-engine'),
	adEngine = require('./module/ad-engine'),
	admin = require('./module/admin-engine'),
	category = require('./module/category-engine'),
	videoEngine = require('./module/video-engine'),
	port = 88,
	host = '0.0.0.0',
	app: Express = express();

app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/image/ad', express.static(config.imageDirectory, { fallthrough: false }));
app.use(middleWare.accessControl);

const cleanupExpiredRefreshTokens = async (): Promise<void> => {
	const result = await sql.executeStmt('delete from refresh_tokens where expires_at <= ?', [Date.now()]);
	if (result.error) {
		console.error('Expired refresh-token cleanup failed', result.error);
	}
};

void cleanupExpiredRefreshTokens();
setInterval(() => {
	void cleanupExpiredRefreshTokens();
}, 60 * 60 * 1000);

app.post('/advertise', express.urlencoded({ extended: false }), adEngine.lists);

app.post('/advertise-detail', express.urlencoded({ extended: false }), adEngine.detail);

app.post('/search-advertise', express.urlencoded({ extended: false }), adEngine.search);

app.post('/post-ad', upload.any(), adEngine.postAdvertise);

app.post('/visitor-ad', upload.any(), adEngine.EditVisitorAdvertise);

app.post('/edit-ad', upload.any(), middleWare.checkPermission, adEngine.EditAdvertise);

app.post('/generate-static-content', express.urlencoded({ extended: false }), middleWare.checkPermission, admin.generateStaticContent);

app.post('/generate-htmls', express.urlencoded({ extended: false }), middleWare.checkPermission, admin.generateHtmls);

app.post('/admin-function', express.urlencoded({ extended: false }), middleWare.checkPermission, admin.adminFunction);

app.post('/save_category.pl', express.urlencoded({ extended: false }), middleWare.checkPermission, category.saveCategory);

app.post('/save_subcategory.pl', express.urlencoded({ extended: false }), middleWare.checkPermission, category.saveSubcategory);

app.post('/sign-in', express.urlencoded({ extended: false }), userEngine.signIn);

app.post('/sign-out', express.urlencoded({ extended: false }), userEngine.signOut);

app.post('/register', express.urlencoded({ extended: false }), userEngine.register);

app.post('/forget-password', express.urlencoded({ extended: false }), userEngine.forgetPassword);

app.post('/reset-password', express.urlencoded({ extended: false }), userEngine.resetPassword);

app.post('/fetch-user-profile', express.urlencoded({ extended: false }), middleWare.checkPermission, userEngine.workUserData);

app.post('/fetch-user-ads', express.urlencoded({ extended: false }), middleWare.checkPermission, userEngine.workUserData);

app.post('/fetch-user-ad', express.urlencoded({ extended: false }), middleWare.checkPermission, userEngine.workUserData);

app.post('/change-user-profile', express.urlencoded({ extended: false }), middleWare.checkPermission, userEngine.workUserData);

app.post('/delete-user-advertise', express.urlencoded({ extended: false }), middleWare.checkPermission, userEngine.workUserData);

app.post('/delete-visitor-advertise', express.urlencoded({ extended: false }), userEngine.workVisitorData);

app.post('/fetch-visitor-ad', express.urlencoded({ extended: false }), userEngine.fetchVisitorAdvertise);

app.post('/request', express.urlencoded({ extended: false }), server.request);

app.post('/create-video', upload.any(), videoEngine.createVideo);

app.get('/advertise-list', express.urlencoded({ extended: false }), adEngine.getlists);

app.listen(port, host);
