import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators";

import { validate as isUUID } from 'uuid';

import { Product } from "../../entities/product.entity";
import { CreateProductDto } from "../../dto/create-product.dto";
import { UpdateProductDto } from "../../dto/update-product.dto";
import { PaginationDto } from './../../../common/dtos/pagination.dto';

import { IProductRepository } from "../IProductRepository";
import { Repository } from "typeorm";


@Injectable()
export class ProductRepository implements IProductRepository {
      
  private readonly logger = new Logger('ProductsRepository');
    
  /**
   * Creates an instance of ProductRepository
   * @param _repository - TypeORM repository for Product entity
   */
  constructor(
    @InjectRepository(Product) 
    private readonly _repository: Repository<Product>
  ) 
  {}


  /**
   * Creates a new product in the database
   * @param createProductDto - Data transfer object containing product details
   * @returns The created product entity
   * @throws Error if product creation fails
   */
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this._repository.create(createProductDto);
      await this._repository.save(product);
      return product;
    } catch (error) {
      throw(error);
    }
  }

  
  /**
   * Retrieves all products with pagination
   * @param paginationDto - Pagination parameters (limit and offset)
   * @returns Array of products based on pagination
   */
  async findAll(paginationDto: PaginationDto) {
    return await this._repository.find({
      take: paginationDto.limit,
      skip: paginationDto.offset,
    });
  }

  /**
   * Finds a single product by ID, title, or slug
   * @param filter - Can be a UUID, product title, or slug
   * @returns The found product entity
   * @throws NotFoundException if product is not found
   */
  async findOne(filter: string) {
    try {
      let product: Product | null;

      if(isUUID(filter)) {
        product =  await this._repository.findOneBy({ id: filter });
      } else {
        const queryBuilder = this._repository.createQueryBuilder('prod');
        product = await queryBuilder.where('UPPER(prod.title) = :title OR prod.slug = :slug', {
          title: filter.toUpperCase(),
          slug: filter.toLowerCase()
        }).getOne();
      }

      if (!product)
        throw new NotFoundException(`Product with ${filter} not found`);
      return product;      

    } catch (error) {
      throw (error);
    }
  }

  /**
   * Updates an existing product by ID
   * @param id - UUID of the product to update
   * @param updateProductDto - Data transfer object containing updated product details
   * @returns The updated product entity
   * @throws NotFoundException if product with given ID is not found
   * @throws Error if update operation fails
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    
    const product = await this._repository.preload({
      id,
      ...updateProductDto
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    try {
      await this._repository.save(product);
      return product;
    } catch (error) {
      throw(error);
    }
  }

  /**
   * Removes a product from the database
   * @param id - UUID of the product to remove
   * @returns The removed product entity
   * @throws NotFoundException if product with given ID is not found
   */
  async remove(id: string) {
    try {
      const existsProduct = await this.findOne(id);
      return await this._repository.remove(existsProduct);
    } catch (error) {
      throw(error);
    }
  }
}