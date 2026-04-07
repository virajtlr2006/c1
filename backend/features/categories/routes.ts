import { Router } from 'express';
import { CategoriesController } from './controller';

const router = Router();

// GET /api/categories - Get available event categories with counts
router.get('/', CategoriesController.getCategories);

// GET /api/categories/all - Get all categories (including those with 0 events)
router.get('/all', CategoriesController.getAllCategories);

export default router;