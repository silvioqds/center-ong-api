import { Injectable, OnModuleInit } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from 'src/entity/category.entity';

@Injectable()
export class CategoriesInitializationService implements OnModuleInit {
  constructor(private readonly categoryService: CategoryService) {}

  async onModuleInit() {
    const categoriasPadrao = ['Animais', 'Idosos', 'Crianças e Adolescentes', 'Meio Ambiente'];

    const categoriasExistentes = await this.categoryService.findAll();
    
    for (const nomeCategoria of categoriasPadrao) {
      const exist = categoriasExistentes.some(c => c.name == nomeCategoria)        
      if(!exist){
        const cat = new Category()
        cat.name = nomeCategoria;
        await this.categoryService.create(cat);
      }
    }

    //Remover categorias que não estão na lista padrão
    const categoriasParaRemover = categoriasExistentes.filter(c => !categoriasPadrao.includes(c.name));

    for (const categoria of categoriasParaRemover) {
      await this.categoryService.remove(categoria);
    }
    
  }
}
