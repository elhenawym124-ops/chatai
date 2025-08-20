import { Request, Response } from 'express';
import { BaseController } from '../../../shared/base/BaseController';
import { CustomerService } from '../services/CustomerService';
import { ValidationError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
// Use Express Request with user property

/**
 * Customer Controller
 * 
 * Handles all customer-related HTTP requests including:
 * - Customer CRUD operations
 * - Customer search and filtering
 * - Customer interactions tracking
 * - Customer segmentation
 */
export class CustomerController extends BaseController {
  private customerService: CustomerService;

  constructor() {
    super();
    this.customerService = new CustomerService();
  }

  /**
   * Get all customers with pagination and filtering
   * GET /api/v1/customers
   */
  getCustomers = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const paginationParams = this.getPaginationParams(req);
    const filterParams = this.getFilterParams(req);

    // Add company filter
    const filters = {
      ...filterParams,
      companyId: user.companyId,
    };

    const customers = await this.customerService.getCustomers(filters, paginationParams);
    const total = await this.customerService.getCustomersCount(filters);

    this.successWithPagination(
      res,
      customers,
      {
        page: paginationParams.page || 1,
        limit: paginationParams.limit || 10,
        total,
      },
      'Customers retrieved successfully'
    );
  });

  /**
   * Get customer by ID
   * GET /api/v1/customers/:id
   */
  getCustomer = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    const customer = await this.customerService.getCustomerById(id, user.companyId);

    this.success(res, customer, 'Customer retrieved successfully');
  });

  /**
   * Create new customer
   * POST /api/v1/customers
   */
  createCustomer = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { email, firstName, lastName, phone, address, city, country, tags, notes, source } = req.body;

    // Validate required fields
    this.validateRequiredFields(req.body, ['firstName', 'lastName']);

    // Validate email if provided
    if (email && !this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate phone if provided
    if (phone && !this.validatePhone(phone)) {
      throw new ValidationError('Invalid phone format');
    }

    // Sanitize inputs
    const customerData = {
      email: email ? this.sanitizeInput(email.toLowerCase()) : undefined,
      firstName: this.sanitizeInput(firstName),
      lastName: this.sanitizeInput(lastName),
      phone: phone ? this.sanitizeInput(phone) : undefined,
      address: address ? this.sanitizeInput(address) : undefined,
      city: city ? this.sanitizeInput(city) : undefined,
      country: country ? this.sanitizeInput(country) : undefined,
      tags: tags ? JSON.stringify(tags) : undefined,
      notes: notes ? this.sanitizeInput(notes) : undefined,
      source: source ? this.sanitizeInput(source) : undefined,
      companyId: user.companyId,
      status: 'LEAD', // Default status for new customers
    };

    const customer = await this.customerService.createCustomer(customerData);

    enhancedLogger.business('customer_created', {
      customerId: customer.id,
      companyId: user.companyId,
      createdBy: user.id,
    });

    this.success(res, customer, 'Customer created successfully', 201);
  });

  /**
   * Update customer
   * PUT /api/v1/customers/:id
   */
  updateCustomer = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const { email, firstName, lastName, phone, address, city, country, tags, notes, source, status } = req.body;

    // Validate email if provided
    if (email && !this.validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate phone if provided
    if (phone && !this.validatePhone(phone)) {
      throw new ValidationError('Invalid phone format');
    }

    // Sanitize inputs
    const updateData: any = {};
    if (email !== undefined) updateData.email = email ? this.sanitizeInput(email.toLowerCase()) : null;
    if (firstName) updateData.firstName = this.sanitizeInput(firstName);
    if (lastName) updateData.lastName = this.sanitizeInput(lastName);
    if (phone !== undefined) updateData.phone = phone ? this.sanitizeInput(phone) : null;
    if (address !== undefined) updateData.address = address ? this.sanitizeInput(address) : null;
    if (city !== undefined) updateData.city = city ? this.sanitizeInput(city) : null;
    if (country !== undefined) updateData.country = country ? this.sanitizeInput(country) : null;
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null;
    if (notes !== undefined) updateData.notes = notes ? this.sanitizeInput(notes) : null;
    if (source !== undefined) updateData.source = source ? this.sanitizeInput(source) : null;
    if (status) updateData.status = status;

    const customer = await this.customerService.updateCustomer(id, updateData, user.companyId);

    enhancedLogger.business('customer_updated', {
      customerId: id,
      companyId: user.companyId,
      updatedBy: user.id,
      updatedFields: Object.keys(updateData),
    });

    this.success(res, customer, 'Customer updated successfully');
  });

  /**
   * Delete customer
   * DELETE /api/v1/customers/:id
   */
  deleteCustomer = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    await this.customerService.deleteCustomer(id, user.companyId);

    enhancedLogger.business('customer_deleted', {
      customerId: id,
      companyId: user.companyId,
      deletedBy: user.id,
    });

    this.success(res, null, 'Customer deleted successfully');
  });

  /**
   * Get customer interactions
   * GET /api/v1/customers/:id/interactions
   */
  getCustomerInteractions = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const paginationParams = this.getPaginationParams(req);

    const interactions = await this.customerService.getCustomerInteractions(id, user.companyId, paginationParams);

    this.success(res, interactions, 'Customer interactions retrieved successfully');
  });

  /**
   * Add customer note
   * POST /api/v1/customers/:id/notes
   */
  addCustomerNote = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const { content } = req.body;

    this.validateRequiredFields(req.body, ['content']);

    const noteData = {
      content: this.sanitizeInput(content),
      customerId: id,
      authorId: user.id,
    };

    const note = await this.customerService.addCustomerNote(noteData, user.companyId);

    enhancedLogger.business('customer_note_added', {
      customerId: id,
      noteId: note.id,
      authorId: user.id,
    });

    this.success(res, note, 'Customer note added successfully', 201);
  });

  /**
   * Get customer notes
   * GET /api/v1/customers/:id/notes
   */
  getCustomerNotes = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;
    const paginationParams = this.getPaginationParams(req);

    const notes = await this.customerService.getCustomerNotes(id, user.companyId, paginationParams);

    this.success(res, notes, 'Customer notes retrieved successfully');
  });

  /**
   * Get customer statistics
   * GET /api/v1/customers/:id/stats
   */
  getCustomerStats = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { id } = req.params;

    const stats = await this.customerService.getCustomerStats(id, user.companyId);

    this.success(res, stats, 'Customer statistics retrieved successfully');
  });

  /**
   * Search customers
   * GET /api/v1/customers/search
   */
  searchCustomers = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ValidationError('Search query is required');
    }

    const searchQuery = this.sanitizeInput(q);
    const customers = await this.customerService.searchCustomers(searchQuery, user.companyId);

    this.success(res, customers, 'Search results retrieved successfully');
  });

  /**
   * Get customer segments
   * GET /api/v1/customers/segments
   */
  getCustomerSegments = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);

    const segments = await this.customerService.getCustomerSegments(user.companyId);

    this.success(res, segments, 'Customer segments retrieved successfully');
  });

  /**
   * Export customers
   * GET /api/v1/customers/export
   */
  exportCustomers = this.asyncHandler(async (req: Request, res: Response) => {
    const user = this.getAuthenticatedUser(req);
    const filterParams = this.getFilterParams(req);
    const { format = 'csv' } = req.query;

    const filters = {
      ...filterParams,
      companyId: user.companyId,
    };

    const exportData = await this.customerService.exportCustomers(filters, format as string);

    enhancedLogger.business('customers_exported', {
      companyId: user.companyId,
      exportedBy: user.id,
      format,
      count: exportData.count,
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=customers.${format}`);

    res.send(exportData.data);
  });
}
