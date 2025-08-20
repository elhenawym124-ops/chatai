import { PrismaClient } from '@prisma/client';
import { 
  BaseEntity, 
  IRepository, 
  PaginationParams, 
  FilterParams,
  TransactionCallback 
} from '../types/common';
import { NotFoundError, DatabaseError } from '../errors/AppError';
import { logger } from '../utils/logger';

/**
 * Base Repository Class
 * 
 * Provides common database operations for all entities:
 * - CRUD operations
 * - Pagination
 * - Filtering
 * - Transaction support
 * - Error handling
 */
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma model delegate
   */
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const entity = await this.model.findUnique({
        where: { id },
        ...this.getDefaultIncludes(),
      });

      return entity;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ID:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName}`);
    }
  }

  /**
   * Find entity by ID or throw error
   */
  async findByIdOrThrow(id: string): Promise<T> {
    const entity = await this.findById(id);
    
    if (!entity) {
      throw new NotFoundError(this.modelName, id);
    }

    return entity;
  }

  /**
   * Find multiple entities with pagination and filtering
   */
  async findMany(params: PaginationParams & FilterParams = {}): Promise<T[]> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...filters
      } = params;

      const skip = (page - 1) * limit;
      const where = this.buildWhereClause(filters);
      const orderBy = this.buildOrderByClause(sortBy, sortOrder);

      const entities = await this.model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        ...this.getDefaultIncludes(),
      });

      return entities;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} entities:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName} entities`);
    }
  }

  /**
   * Count entities with filtering
   */
  async count(params: FilterParams = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(params);
      
      return await this.model.count({ where });
    } catch (error) {
      logger.error(`Error counting ${this.modelName} entities:`, error);
      throw new DatabaseError(`Failed to count ${this.modelName} entities`);
    }
  }

  /**
   * Create new entity
   */
  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    try {
      const entity = await this.model.create({
        data: this.preprocessCreateData(data),
        ...this.getDefaultIncludes(),
      });

      logger.info(`Created ${this.modelName}:`, { id: entity.id });
      return entity;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to create ${this.modelName}`);
    }
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T> {
    try {
      // Check if entity exists
      await this.findByIdOrThrow(id);

      const entity = await this.model.update({
        where: { id },
        data: this.preprocessUpdateData(data),
        ...this.getDefaultIncludes(),
      });

      logger.info(`Updated ${this.modelName}:`, { id });
      return entity;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`Error updating ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to update ${this.modelName}`);
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<void> {
    try {
      // Check if entity exists
      await this.findByIdOrThrow(id);

      await this.model.delete({
        where: { id },
      });

      logger.info(`Deleted ${this.modelName}:`, { id });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`Error deleting ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to delete ${this.modelName}`);
    }
  }

  /**
   * Soft delete entity (if supported)
   */
  async softDelete(id: string): Promise<T> {
    try {
      return await this.update(id, { deletedAt: new Date() } as any);
    } catch (error) {
      logger.error(`Error soft deleting ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to soft delete ${this.modelName}`);
    }
  }

  /**
   * Find entities by field value
   */
  async findByField(field: string, value: any): Promise<T[]> {
    try {
      const entities = await this.model.findMany({
        where: { [field]: value },
        ...this.getDefaultIncludes(),
      });

      return entities;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ${field}:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName} by ${field}`);
    }
  }

  /**
   * Find single entity by field value
   */
  async findOneByField(field: string, value: any): Promise<T | null> {
    try {
      const entity = await this.model.findFirst({
        where: { [field]: value },
        ...this.getDefaultIncludes(),
      });

      return entity;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ${field}:`, error);
      throw new DatabaseError(`Failed to find ${this.modelName} by ${field}`);
    }
  }

  /**
   * Execute operation within transaction
   */
  async withTransaction<R>(callback: TransactionCallback<R>): Promise<R> {
    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      logger.error(`Transaction error for ${this.modelName}:`, error);
      throw new DatabaseError('Transaction failed');
    }
  }

  /**
   * Bulk create entities
   */
  async createMany(data: Omit<T, keyof BaseEntity>[]): Promise<{ count: number }> {
    try {
      const result = await this.model.createMany({
        data: data.map(item => this.preprocessCreateData(item)),
      });

      logger.info(`Bulk created ${this.modelName}:`, { count: result.count });
      return result;
    } catch (error) {
      logger.error(`Error bulk creating ${this.modelName}:`, error);
      throw new DatabaseError(`Failed to bulk create ${this.modelName}`);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.model.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking ${this.modelName} existence:`, error);
      return false;
    }
  }

  // Abstract methods to be implemented by child classes

  /**
   * Build WHERE clause for filtering
   */
  protected abstract buildWhereClause(filters: FilterParams): any;

  /**
   * Get default includes for queries
   */
  protected abstract getDefaultIncludes(): any;

  /**
   * Preprocess data before creating
   */
  protected preprocessCreateData(data: any): any {
    return data;
  }

  /**
   * Preprocess data before updating
   */
  protected preprocessUpdateData(data: any): any {
    return data;
  }

  /**
   * Build ORDER BY clause
   */
  protected buildOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc'): any {
    return { [sortBy]: sortOrder };
  }
}
