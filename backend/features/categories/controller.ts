import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { events } from '../../db/schema';
import { sql, eq } from 'drizzle-orm';
import { ApiResponse, Category } from './types';

// Response utilities
const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export class CategoriesController {
  // GET /api/categories - Get available event categories with counts
  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get categories with event counts (only published events)
      const categories = await db
        .select({
          name: events.category,
          count: sql<number>`count(*)::int`,
        })
        .from(events)
        .where(eq(events.status, 'published'))
        .groupBy(events.category)
        .orderBy(events.category);

      res.json(successResponse(categories));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/categories/all - Get all categories (including those with 0 events)
  static async getAllCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Predefined categories - you can extend this list
      const predefinedCategories = [
        'Technology',
        'Business',
        'Health & Wellness',
        'Education',
        'Arts & Culture',
        'Sports & Recreation',
        'Food & Drink',
        'Music',
        'Networking',
        'Community',
        'Science',
        'Environment',
        'Finance',
        'Marketing',
        'Design',
        'Travel',
        'Fashion',
        'Photography',
        'Gaming',
        'Other'
      ];

      // Get actual categories from database
      const dbCategories = await db
        .select({
          name: events.category,
          count: sql<number>`count(*)::int`,
        })
        .from(events)
        .where(eq(events.status, 'published'))
        .groupBy(events.category);

      // Create a map of db categories for easy lookup
      const dbCategoryMap = new Map(dbCategories.map(cat => [cat.name, cat.count]));

      // Combine predefined and database categories
      const allCategories: Category[] = predefinedCategories.map(name => ({
        name,
        count: dbCategoryMap.get(name) || 0,
      }));

      // Add any additional categories from database not in predefined list
      dbCategories.forEach(dbCat => {
        if (!predefinedCategories.includes(dbCat.name)) {
          allCategories.push(dbCat);
        }
      });

      // Sort by name
      allCategories.sort((a, b) => a.name.localeCompare(b.name));

      res.json(successResponse(allCategories));
    } catch (error) {
      next(error);
    }
  }
}