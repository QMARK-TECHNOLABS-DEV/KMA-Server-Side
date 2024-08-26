const guestCtrl = require("../../controllers/v1/guest-controller");
const upload = require("../middlewares/multerToS3");
const guestRouter = require("express").Router();
const multer = require("multer");

const upload = multer();

guestRouter.post('/register', upload.single('file'), guestCtrl.CreateApplication);

guestRouter.post('/check/username', guestCtrl.usernameChecker)

module.exports = {guestRouter}