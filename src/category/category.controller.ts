import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Category } from 'src/entity/category.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}


    @Get()    
    FindAll() : Promise<Category[]> {
        return this.categoryService.findAll()
    }

}
