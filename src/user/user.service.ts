import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Category } from 'src/entity/category.entity';
import * as bcrypt from 'bcrypt';
import { CryptoService } from 'src/auth/crypto.service';
import { validate } from 'class-validator';
import { BaseNotification } from 'src/entity/base.notification';

@Injectable()
export class UserService  {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cryptoService: CryptoService,
  ) {  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.following', 'following')   
    .andWhere('user.dateDeleted is null')
    .getMany();

    users.forEach(user => {
      delete user.password;
      user.following.forEach(follower => {
        delete follower.password;
      })
    });
    
  
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user  = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.following', 'following')
    .where('user.id = :id', { id })  
    .getOne();

    delete user.password;

    user.following.forEach(follower => {
        delete follower.password;
    })

    return user;
  }  

  async create(user: User): Promise<User> {  
    const { username, name, aboutme, email, password, profilepic, isOng, birthdate, telephone, gender, keyPix, categories, category } = user;   
      
    const existed = await this.findByEmail(email);

    if(existed)
      throw new BadRequestException('Usuário já existe, faça login');

    if(!isOng && keyPix)
      throw new BadRequestException("Apenas ONG'S possuem permissão para cadastrar chave pix");

    if(isOng && !category)
      throw new BadRequestException("É necessário informar a categoria da ONG");    

    const hashedPassword = await this.cryptoService.hashPassword(password);
    const newUser = this.userRepository.create({
      username,
      email,
      name,
      aboutme,
      password : hashedPassword,
      isOng,
      profilepic,
      birthdate,
      telephone,
      gender,
      keyPix,
    });

    if (isOng && category) {        
        const existingCategory = await this.categoryRepository.findOne({ where: { name: category.name } });

        if (!existingCategory) {
          throw new BadRequestException('Categoria não encontrada');
        }

        newUser.category = existingCategory;
    }

    if (categories && categories.length > 0) {           
      const categoriesEntities = await this.categoryRepository.findBy({ name: In(categories.map(category => category.name)) } );      
      newUser.categories = categoriesEntities;
    }

   
    await this.userRepository.save(newUser);
    delete newUser.password;
    return newUser;
  }
  
  async update(updatedFields: Partial<User>): Promise<User> {
    try {
        const existingUser = await this.userRepository.findOne({ where: { id: updatedFields.id } });

        if (!existingUser) {
            throw new Error('Usuário não encontrado');
        }

        if(!existingUser.isOng && updatedFields.keyPix && updatedFields.keyPix.length > 0)
          throw new BadRequestException('Apenas ONG possue permissão para cadastrar chave pix');
        
        Object.keys(updatedFields).forEach(async (field) => {
            const value = updatedFields[field];

            if (value !== undefined) {                
                if (field === 'password') {                  
                    await this.updateUserPassword(updatedFields.email, updatedFields.password)
                } else if (field === 'categories') {                                    
                  const newCategories = await this.categoryRepository.findBy({ name: In(value.map(category => category.name)) });
                  newCategories.forEach(newCategory => {
                      if (!existingUser.categories.some(userCategory => userCategory.id === newCategory.id)) {
                          existingUser.categories.push(newCategory);
                      }
                  });
                } else {
                    existingUser[field] = value;
                }
            }
        });              

        if (existingUser.isOng && updatedFields.category !== undefined) {
          const category = await this.categoryRepository.findOne({ where: { name: updatedFields.category.name } });

          if (!category) {
              throw new BadRequestException('Categoria não encontrada');
          }

          existingUser.category = category;
        }

        const updatedUser = await this.userRepository.save(existingUser);
        delete updatedUser.password;
        return updatedUser;
    } catch (error) {
        throw new InternalServerErrorException(`Erro ao atualizar usuário: ${error.message}`);
    }
}


  async delete(id: number) : Promise<string> {
    try{      
      await this.userRepository.delete(id);
      return  "Excluido com sucesso!";
    } catch (error) {
      throw new Error(`Erro ao excluir usuário: ${error.message}`);
    }
         
  }

  async findByEmail(email : string) : Promise<User> {     
        return await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.following', 'following')
        .leftJoinAndSelect('user.categories','categories')
        .where('user.email = :email', { email })  
        .getOne();
         
  }

  async updateUserPassword(email: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({where : { email : email}});  
      user.password = await this.cryptoService.hashPassword(newPassword);
      await this.userRepository.save(user);
    } catch (error){
      throw new Error('Erro ao buscar usuário');
    } 
  }

  async followUser(followerId: number, userId: number): Promise<void> {
    const follower =   await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.following', 'following')
    .where('user.id = :followerId', { followerId })  
    .getOne();

    const userToFollow = await this.userRepository.findOne({ where: { id: userId} });

    if (!follower || !userToFollow) {
      throw new NotFoundException('User not found');
    }
    
    if(follower.id == userToFollow.id)
      throw new BadRequestException('Não é possível seguir a si mesmo');

    const isAlreadyFollowing = follower.following.some(user => user.id === userId);

    if (!isAlreadyFollowing) {
      follower.following = follower.following || [];
      follower.following.push(userToFollow);
    }
  
    await this.userRepository.save(follower);
  }

  async unfollowUser(followerId: number, userId: number): Promise<void> {
    const follower = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.following', 'following')
    .where('user.id = :followerId', { followerId })    
    .getOne();

    if (!follower) {
      throw new NotFoundException('User not found');
    }

    if(follower.following == undefined)
      throw new NotFoundException('There are no followers')

    follower.following = follower.following.filter(user => user.id !== userId);
    await this.userRepository.save(follower);
  }

  async removeCategoryFromUser(userId: number, categoryId: number): Promise<User> {
    try {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['categories'] });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const categoryToRemove = user.categories.find(category => category.id === categoryId);

        if (!categoryToRemove) {
            throw new Error('Categoria não encontrada no usuário');
        }

        user.categories = user.categories.filter(category => category.id !== categoryId);

        await this.userRepository.save(user);

        return user;
    } catch (error) {
        throw new Error(`Erro ao remover categoria do usuário: ${error.message}`);
    }
  }

  async searchByUserCategories(userId: number): Promise<User[]> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['categories', 'following'] });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    const followedUserIds = user.following.map(followedUser => followedUser.id);

    const usersByCategories = await this.userRepository.find({
      where: {
          category: {
              id: In(user.categories.map(category => category.id))
          },
        id: Not(In([userId, ...followedUserIds]))
      },
      select: ['id', 'name', 'username'],
    });
    
    usersByCategories.map(user => {
       delete user.categories;
    });

    return usersByCategories;
  }


}