import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from '../common/dtos/pagination.dto';

import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

import { validate as isUUID } from 'uuid';
import type { IProductRepository } from './repos/IProductRepository';
import { ProductRepository } from './repos/implementations/ProductRepository';



@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  private readonly _repository: IProductRepository;

  /**
   * Creates an instance of ProductsService
   * @param repository - Product repository implementation for data access
   */
  constructor(
    @Inject('IProductRepository')
    private readonly repository: IProductRepository,
  ) {}

  /**
   * Creates a new product
   * @param createProductDto - Data transfer object containing product details
   * @returns The created product entity
   * @throws BadRequestException if product data violates unique constraints
   * @throws InternalServerErrorException if an unexpected error occurs
   */
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this._repository.create(createProductDto);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Retrieves all products with pagination
   * @param paginationDto - Pagination parameters (limit defaults to 10, offset defaults to 0)
   * @returns Array of products based on pagination
   * @throws InternalServerErrorException if an unexpected error occurs
   */
  async findAll(paginationDto: PaginationDto) {
    try {
      //validate paginationDto values if needed
      let limit = paginationDto.limit;
      let offset = paginationDto.offset;  

      if(!limit || limit <= 0) {
        limit = 10;
      }
      if(!offset || offset < 0) {
        offset = 0;
      } 
    
      paginationDto = { limit, offset };

      const products = await this.repository.findAll(paginationDto);
      return products;
    }
    catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Finds a single product by ID, title, or slug
   * @param filter - Can be a UUID, product title, or slug
   * @returns The found product entity
   * @throws NotFoundException if product is not found
   * @throws BadRequestException if UUID format is invalid
   * @throws InternalServerErrorException if an unexpected error occurs
   */
  async findOne(filter: string) {
    try {
      return await this._repository.findOne(filter);   
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Updates an existing product by ID
   * @param id - UUID of the product to update
   * @param updateProductDto - Data transfer object containing updated product details
   * @returns The updated product entity
   * @throws NotFoundException if product with given ID is not found
   * @throws BadRequestException if update data violates constraints or UUID format is invalid
   * @throws InternalServerErrorException if an unexpected error occurs
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      return await this._repository.update(id, updateProductDto);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Removes a product from the database
   * @param id - UUID of the product to remove
   * @returns Confirmation message with the removed product ID
   * @throws NotFoundException if product with given ID is not found
   * @throws BadRequestException if UUID format is invalid
   * @throws InternalServerErrorException if an unexpected error occurs
   */
  async remove(id: string) {
    try {
      const removedProduct = await this._repository.remove(id);
      return { message: `Product with id ${id} has been removed` };
    } catch (error) {
      this.handleDBExceptions(error);
    }
    

  }

  /**
   * Handles database exceptions and converts them to appropriate HTTP exceptions
   * @param error - The error object from database operations
   * @throws BadRequestException for unique constraint violations (23505) or invalid UUID format (22P02)
   * @throws InternalServerErrorException for any other unexpected errors
   */
  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail); 

    if (error.code === '22P02')
      throw new BadRequestException(`Invalid UUID format`);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
