import {Router} from 'express'
const router = Router();
import {register, login, currentUser, addContact, getAllContacts, logoutUser} from '../controllers/userController';
import authToken from '../middleware/authToken';

router.post("/register", register);
router.post("/login", login);
router.get("/getCurrentUserDetails", authToken, currentUser);
router.post("/addContact", authToken, addContact );
router.get("/getAllContacts", authToken, getAllContacts );
router.get("/logoutUser", authToken, logoutUser);

export default router;