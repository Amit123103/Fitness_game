import { Router } from 'express';
import { signup, login, supabaseLogin, firebaseLogin } from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/supabase-login', supabaseLogin);
router.post('/firebase-login', firebaseLogin);

export default router;
