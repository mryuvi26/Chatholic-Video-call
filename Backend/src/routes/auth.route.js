import express from 'express';
import { signup, login, logout, onboarding } from '../Controllers/auth.controller.js';
import { protectRoute } from '../Middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.post('/onboarding', protectRoute, onboarding);

router.get('/me', protectRoute, (req, res)=>{
    res.status(200).json({ success: true, user: req.user });
})


export default router;