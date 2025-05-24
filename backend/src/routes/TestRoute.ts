import { Router } from 'express';
import { resetDatabase } from '@/controller/test/TestController';

const router = Router();

router.post('/test/reset-db', resetDatabase);

export default router;
