import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entity/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    return await this.categoryRepository.findOne({ where: { id } });
  }  

  async create(category: Category): Promise<Category> {
    return await this.categoryRepository.save(category);
  }

  async remove(category: Category): Promise<void> {
    await this.categoryRepository.remove(category);
  }
}
