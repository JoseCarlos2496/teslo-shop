import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from '../common/dtos/pagination.dto';

import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(@InjectRepository(Product) private readonly _repository: Repository<Product>) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this._repository.create(createProductDto);
      await this._repository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this._repository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(filter: string) {
    
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
  }

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
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this._repository.remove(product);
    return { message: `Product with id ${id} has been removed` };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail); 

    if (error.code === '22P02')
      throw new BadRequestException(`Invalid UUID format`);

    

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
