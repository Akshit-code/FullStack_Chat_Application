import {Router} from 'express'
const router = Router();
import {register, login, currentUser, addContact, 
    getAllContacts, logoutUser, addGroup, getAllGroups} from '../controllers/userController';
import { sendMessage, getAllPrivateMessages, getAllGroupMessages, sendMediaMessage} from '../services/message'; 
import authToken from '../middleware/authToken';
import multer from 'multer';
// const storage = multer.memoryStorage();
const upload = multer();

router.post("/register", register);
router.post("/login", login);
router.get("/logoutUser", authToken, logoutUser);
router.get("/getCurrentUserDetails", authToken, currentUser);

router.post("/addContact", authToken, addContact );
router.get("/getAllContacts", authToken, getAllContacts );

router.post("/addGroup", authToken, addGroup);
router.get("/getAllGroups", authToken, getAllGroups);

router.post("/sendMessage", authToken, sendMessage);
router.post("/sendMediaMessage", upload.single('file') , authToken, sendMediaMessage);

router.get("/getAllPrivateMessages", authToken, getAllPrivateMessages);
router.post("/getAllGroupMessages", authToken, getAllGroupMessages);

export default router;