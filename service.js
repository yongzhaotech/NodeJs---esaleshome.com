'use strict';

require('dotenv').config();

const express = require('express'),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	multer = require('multer'),
	config = require('./module/ad-config'),
	upload = multer({dest: config.uploadDirectory, fileFilter: config.fileFilter, limits: {fileSize: config.photoSize, files: config.fileCount}}),
	middleWare = require('./module/middleware'),
	server = require('./module/server-engine'),
	userEngine = require('./module/user-engine'),
	adEngine = require('./module/ad-engine'),
	admin = require('./module/admin-engine'),
	videoEngine = require('./module/video-engine'),
	port = 88,
	host = '0.0.0.0',
	app = express();

app.use(cookieParser());
app.use(middleWare.accessControl);
app.use('/ads/src', express.static(__dirname));

app.post('/advertise', express.urlencoded({extended: false}), adEngine.lists);

app.post('/advertise-detail', express.urlencoded({extended: false}), adEngine.detail);

app.post('/search-advertise', express.urlencoded({extended: false}), adEngine.search);

app.post('/post-ad', upload.any(), adEngine.postAdvertise);

app.post('/visitor-ad', upload.any(), adEngine.EditVisitorAdvertise);

app.post('/edit-ad', upload.any(), middleWare.checkPermission, adEngine.EditAdvertise);

app.post('/generate-static-content', express.urlencoded({extended: false}), middleWare.checkPermission, admin.generateStaticContent);

app.post('/generate-htmls', express.urlencoded({extended: false}), middleWare.checkPermission, admin.generateHtmls);

app.post('/admin-function', express.urlencoded({extended: false}), middleWare.checkPermission, admin.adminFunction);

app.post('/sign-in', express.urlencoded({extended: false}), userEngine.signIn);

app.post('/sign-out', express.urlencoded({extended: false}), userEngine.signOut);

app.post('/register', express.urlencoded({extended: false}), userEngine.register);

app.post('/forget-password', express.urlencoded({extended: false}), userEngine.forgetPassword);

app.post('/reset-password', express.urlencoded({extended: false}), userEngine.resetPassword);

app.post('/fetch-user-profile', express.urlencoded({extended: false}), middleWare.checkPermission, userEngine.workUserData);

app.post('/fetch-user-ads', express.urlencoded({extended: false}), middleWare.checkPermission, userEngine.workUserData);

app.post('/fetch-user-ad', express.urlencoded({extended: false}), middleWare.checkPermission, userEngine.workUserData);

app.post('/change-user-profile', express.urlencoded({extended: false}), middleWare.checkPermission, userEngine.workUserData);

app.post('/delete-user-advertise', express.urlencoded({extended: false}), middleWare.checkPermission, userEngine.workUserData);

app.post('/delete-visitor-advertise', express.urlencoded({extended: false}), userEngine.workVisitorData);

app.post('/fetch-visitor-ad', express.urlencoded({extended: false}), userEngine.fetchVisitorAdvertise);

app.post('/request', express.urlencoded({extended: false}), server.request);

app.post('/create-video', upload.any(), videoEngine.createVideo);

app.listen(port, host);
