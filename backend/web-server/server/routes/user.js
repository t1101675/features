/**
  * 网络路由
  */

const UserController = require('../controller/user')
const Router = require('koa-router')

const childRouter = new Router()
const checkToken = require('../token/checkToken')

/**
  * 用户逻辑路由
  */
childRouter.post('/login', UserController.Login);
childRouter.post('/register', UserController.Register);
childRouter.get('/activate', UserController.ActivateUser);
childRouter.post('/resetpw', checkToken, UserController.ChangePassword);
childRouter.get('/game', checkToken, UserController.Game);

childRouter.post('/chav', UserController.CheckAvailable);
childRouter.post('/chni', checkToken, UserController.ChangeNickname);
childRouter.get('/quni', UserController.QueryNickname);

childRouter.post('/reqpw', UserController.RequestNewPassword);
childRouter.post('/newpw', UserController.NewPassword);

childRouter.get('/get_profile', UserController.GetProfile) /* Anyone */
childRouter.get('/get_hero', UserController.GetHero)
childRouter.post('/clear_hero', checkToken, UserController.ClearHero)

childRouter.get('/ranklist', UserController.Ranklist);
childRouter.post('/history', checkToken, UserController.History);
childRouter.post('/users', checkToken, UserController.GetAllUsers);
childRouter.post('/deluser', checkToken, UserController.DeleteUser);

childRouter.post('/getchangcode', UserController.GetChangeCode);
childRouter.post('/getactcode', UserController.GetActivationCode);


/**
  * 文件上传路由
  */
const multer = require('koa-multer');
const upload0 = multer({ dest: process.cwd() + '/uploads/' });
const upload1 = multer({ dest: process.cwd() + '/uploads/' });
childRouter.post('/upload_profile', upload0.single('profile'), checkToken, UserController.UploadProfile);
childRouter.post('/upload_hero', upload1.single('hero'), checkToken, UserController.UploadHero);

module.exports = childRouter;
