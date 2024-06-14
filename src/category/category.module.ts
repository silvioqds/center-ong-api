import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoriesInitializationService } from "./categories-initialization.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "src/entity/category.entity";
import { CategoryController } from './category.controller';



@Module({
    imports : [TypeOrmModule.forFeature([Category])],
    providers: [CategoriesInitializationService, CategoryService],
    exports: [CategoryService],
    controllers: [CategoryController]
})

export class CategoryModule {}