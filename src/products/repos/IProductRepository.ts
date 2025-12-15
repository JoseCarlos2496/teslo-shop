import { PaginationDto } from "src/common/dtos/pagination.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { Product } from "../entities/product.entity";

export interface IProductRepository {
  create(createProductDto: any): Promise<Product>;
  findAll(paginationDto: PaginationDto): Promise<Product[]>;
  findOne(filter: string): Promise<Product>;
  update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
  remove(id: string): Promise<Product>;
}