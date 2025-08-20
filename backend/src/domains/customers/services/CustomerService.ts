import { PrismaClient } from '@prisma/client';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError 
} from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
import { getPrismaClient } from '../../../config/database';
import { PaginationParams, FilterParams } from '../../../shared/types/common';

interface CustomerData {
  email?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tags?: string;
  notes?: string;
  source?: string;
  status?: string;
  companyId: string;
}

interface CustomerNote {
  content: string;
  customerId: string;
  authorId: string;
}

/**
 * Customer Service
 * 
 * Handles all customer business logic including:
 * - Customer CRUD operations
 * - Customer search and filtering
 * - Customer interactions tracking
 * - Customer analytics and segmentation
 */
export class CustomerService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  /**
   * Get customers with filtering and pagination
   */
  async getCustomers(filters: FilterParams & { companyId: string }, pagination: PaginationParams): Promise<any[]> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const { companyId, search, status, dateFrom, dateTo } = filters;

      const skip = (page - 1) * limit;
      const where: any = { companyId };

      // Apply filters
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const customers = await this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              conversations: true,
              orders: true,
              notes_rel: true,
            }
          }
        }
      });

      // Parse tags for each customer
      return customers.map(customer => ({
        ...customer,
        tags: customer.tags ? JSON.parse(customer.tags) : [],
      }));
    } catch (error) {
      enhancedLogger.error('Get customers failed', error);
      throw error;
    }
  }

  /**
   * Get customers count for pagination
   */
  async getCustomersCount(filters: FilterParams & { companyId: string }): Promise<number> {
    try {
      const { companyId, search, status, dateFrom, dateTo } = filters;
      const where: any = { companyId };

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      return await this.prisma.customer.count({ where });
    } catch (error) {
      enhancedLogger.error('Get customers count failed', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string, companyId: string): Promise<any> {
    try {
      const customer = await this.prisma.customer.findFirst({
        where: { id, companyId },
        include: {
          conversations: {
            include: {
              _count: {
                select: { messages: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          notes_rel: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              conversations: true,
              orders: true,
              notes_rel: true,
            }
          }
        }
      });

      if (!customer) {
        throw new NotFoundError('Customer', id);
      }

      return {
        ...customer,
        tags: customer.tags ? JSON.parse(customer.tags) : [],
      };
    } catch (error) {
      enhancedLogger.error('Get customer by ID failed', error, { customerId: id });
      throw error;
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData: CustomerData): Promise<any> {
    try {
      // Check if customer with email already exists in company
      if (customerData.email) {
        const existingCustomer = await this.prisma.customer.findFirst({
          where: {
            email: customerData.email,
            companyId: customerData.companyId,
          }
        });

        if (existingCustomer) {
          throw new ConflictError('Customer with this email already exists');
        }
      }

      const customer = await this.prisma.customer.create({
        data: customerData as any,
        include: {
          _count: {
            select: {
              conversations: true,
              orders: true,
              notes_rel: true,
            }
          }
        }
      });

      enhancedLogger.business('customer_created', {
        customerId: customer.id,
        companyId: customerData.companyId,
      });

      return {
        ...customer,
        tags: customer.tags ? JSON.parse(customer.tags) : [],
      };
    } catch (error) {
      enhancedLogger.error('Create customer failed', error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, updateData: any, companyId: string): Promise<any> {
    try {
      // Check if customer exists and belongs to company
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { id, companyId }
      });

      if (!existingCustomer) {
        throw new NotFoundError('Customer', id);
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingCustomer.email) {
        const emailExists = await this.prisma.customer.findFirst({
          where: {
            email: updateData.email,
            companyId,
            id: { not: id }
          }
        });

        if (emailExists) {
          throw new ConflictError('Customer with this email already exists');
        }
      }

      const customer = await this.prisma.customer.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              conversations: true,
              orders: true,
              notes_rel: true,
            }
          }
        }
      });

      return {
        ...customer,
        tags: customer.tags ? JSON.parse(customer.tags) : [],
      };
    } catch (error) {
      enhancedLogger.error('Update customer failed', error, { customerId: id });
      throw error;
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: string, companyId: string): Promise<void> {
    try {
      // Check if customer exists and belongs to company
      const customer = await this.prisma.customer.findFirst({
        where: { id, companyId }
      });

      if (!customer) {
        throw new NotFoundError('Customer', id);
      }

      // Soft delete by updating status
      await this.prisma.customer.update({
        where: { id },
        data: { status: 'INACTIVE' as any }
      });

      enhancedLogger.business('customer_deleted', { customerId: id });
    } catch (error) {
      enhancedLogger.error('Delete customer failed', error, { customerId: id });
      throw error;
    }
  }

  /**
   * Get customer interactions (conversations, orders, notes)
   */
  async getCustomerInteractions(customerId: string, companyId: string, pagination: PaginationParams): Promise<any> {
    try {
      // Verify customer belongs to company
      const customer = await this.prisma.customer.findFirst({
        where: { id: customerId, companyId }
      });

      if (!customer) {
        throw new NotFoundError('Customer', customerId);
      }

      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      // Get conversations
      const conversations = await this.prisma.conversation.findMany({
        where: {
          // participants: {
          //   some: { customerId }
          // }
        } as any,
        include: {
          _count: { select: { messages: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      });

      // Get orders
      const orders = await this.prisma.order.findMany({
        where: { customerId },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, images: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      // Get notes
      const notes = await this.prisma.customerNote.findMany({
        where: { customerId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return {
        conversations,
        orders,
        notes,
      };
    } catch (error) {
      enhancedLogger.error('Get customer interactions failed', error, { customerId });
      throw error;
    }
  }

  /**
   * Add customer note
   */
  async addCustomerNote(noteData: CustomerNote, companyId: string): Promise<any> {
    try {
      // Verify customer belongs to company
      const customer = await this.prisma.customer.findFirst({
        where: { id: noteData.customerId, companyId }
      });

      if (!customer) {
        throw new NotFoundError('Customer', noteData.customerId);
      }

      const note = await this.prisma.customerNote.create({
        data: noteData,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      return note;
    } catch (error) {
      enhancedLogger.error('Add customer note failed', error);
      throw error;
    }
  }

  /**
   * Get customer notes
   */
  async getCustomerNotes(customerId: string, companyId: string, pagination: PaginationParams): Promise<any[]> {
    try {
      // Verify customer belongs to company
      const customer = await this.prisma.customer.findFirst({
        where: { id: customerId, companyId }
      });

      if (!customer) {
        throw new NotFoundError('Customer', customerId);
      }

      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      return await this.prisma.customerNote.findMany({
        where: { customerId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
    } catch (error) {
      enhancedLogger.error('Get customer notes failed', error, { customerId });
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(customerId: string, companyId: string): Promise<any> {
    try {
      // Verify customer belongs to company
      const customer = await this.prisma.customer.findFirst({
        where: { id: customerId, companyId }
      });

      if (!customer) {
        throw new NotFoundError('Customer', customerId);
      }

      // Get various statistics
      const [
        conversationsCount,
        ordersCount,
        totalSpent,
        lastOrder,
        lastConversation
      ] = await Promise.all([
        this.prisma.conversation.count({
          where: {
            // participants: {
            //   some: { customerId }
            // }
          } as any
        }),
        this.prisma.order.count({
          where: { customerId }
        }),
        this.prisma.order.aggregate({
          where: { customerId, status: { not: 'CANCELLED' } },
          _sum: { total: true }
        }),
        this.prisma.order.findFirst({
          where: { customerId },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.conversation.findFirst({
          where: {
            participants: {
              some: { customerId }
            }
          },
          orderBy: { updatedAt: 'desc' }
        })
      ]);

      return {
        conversationsCount,
        ordersCount,
        totalSpent: totalSpent._sum.total || 0,
        averageOrderValue: ordersCount > 0 ? (totalSpent._sum.total || 0) / ordersCount : 0,
        lastOrderDate: lastOrder?.createdAt,
        lastConversationDate: lastConversation?.updatedAt,
        customerLifetimeValue: totalSpent._sum.total || 0,
        daysSinceLastOrder: lastOrder ? Math.floor((Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null,
        daysSinceLastContact: lastConversation ? Math.floor((Date.now() - lastConversation.updatedAt.getTime()) / (1000 * 60 * 60 * 24)) : null,
      };
    } catch (error) {
      enhancedLogger.error('Get customer stats failed', error, { customerId });
      throw error;
    }
  }

  /**
   * Search customers
   */
  async searchCustomers(query: string, companyId: string): Promise<any[]> {
    try {
      const customers = await this.prisma.customer.findMany({
        where: {
          companyId,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ]
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
      });

      return customers.map(customer => ({
        ...customer,
        tags: customer.tags ? JSON.parse(customer.tags) : [],
      }));
    } catch (error) {
      enhancedLogger.error('Search customers failed', error, { query });
      throw error;
    }
  }

  /**
   * Get customer segments
   */
  async getCustomerSegments(companyId: string): Promise<any> {
    try {
      const [
        totalCustomers,
        activeCustomers,
        leadCustomers,
        vipCustomers,
        recentCustomers
      ] = await Promise.all([
        this.prisma.customer.count({ where: { companyId } }),
        this.prisma.customer.count({ where: { companyId, status: 'ACTIVE' } }),
        this.prisma.customer.count({ where: { companyId, status: 'LEAD' } }),
        this.prisma.customer.count({ 
          where: { 
            companyId, 
            tags: { contains: 'vip' }
          } 
        }),
        this.prisma.customer.count({
          where: {
            companyId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      ]);

      return {
        total: totalCustomers,
        active: activeCustomers,
        leads: leadCustomers,
        vip: vipCustomers,
        recent: recentCustomers,
        segments: [
          { name: 'All Customers', count: totalCustomers, percentage: 100 },
          { name: 'Active', count: activeCustomers, percentage: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0 },
          { name: 'Leads', count: leadCustomers, percentage: totalCustomers > 0 ? (leadCustomers / totalCustomers) * 100 : 0 },
          { name: 'VIP', count: vipCustomers, percentage: totalCustomers > 0 ? (vipCustomers / totalCustomers) * 100 : 0 },
          { name: 'Recent (30 days)', count: recentCustomers, percentage: totalCustomers > 0 ? (recentCustomers / totalCustomers) * 100 : 0 },
        ]
      };
    } catch (error) {
      enhancedLogger.error('Get customer segments failed', error);
      throw error;
    }
  }

  /**
   * Export customers
   */
  async exportCustomers(filters: FilterParams & { companyId: string }, format: string): Promise<{ data: string; count: number }> {
    try {
      const customers = await this.getCustomers(filters, { page: 1, limit: 10000 }); // Get all customers

      if (format === 'csv') {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Created At'];
        const csvData = [
          headers.join(','),
          ...customers.map(customer => [
            customer.id,
            customer.firstName,
            customer.lastName,
            customer.email || '',
            customer.phone || '',
            customer.status,
            customer.createdAt
          ].join(','))
        ].join('\n');

        return { data: csvData, count: customers.length };
      } else {
        return { data: JSON.stringify(customers, null, 2), count: customers.length };
      }
    } catch (error) {
      enhancedLogger.error('Export customers failed', error);
      throw error;
    }
  }
}
