import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductRepository } from './repos/implementations/ProductRepository';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
  ],
  exports: ['IProductRepository'],
})
export class ProductsModule {}