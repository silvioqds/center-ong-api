import { BadRequestException, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { BaseNotification } from 'src/entity/base.notification';
import { CommentEntity } from 'src/entity/comment.entity';
import { Liked } from 'src/entity/like.entity';
import { Post } from 'src/entity/post.entity';
import { SharePost } from 'src/entity/share.entity';
import { User } from 'src/entity/user.entity';
import { PostCreateView } from 'src/entity/view/post/post-create-view';
import { PostUpdateView } from 'src/entity/view/post/post-update-view';
import { In, Repository } from 'typeorm';


@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CommentEntity) 
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(Liked) 
    private readonly likeRepository: Repository<Liked>
  ) {}

  async getPost(postId : number){
    return await this.postRepository.findOne({where: {id : postId}});
  }

  async getFeed(userId: number, page: number = 1, limit: number = 10): Promise<Post[]> {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.following', 'following')
    .where('user.id = :userId', { userId })
    .andWhere('user.dateDeleted is null')
    .getOne();

    if (!user) {
      return [];
    }

    if (!user.following || user.following.length === 0)
      throw new NotFoundException('Not found posts');
      
    user.following.forEach(follower => {
      delete follower.password;
    })  
      
    const followingIds = user.following.map(followedUser => followedUser.id);        

    const posts = await this.postRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.comments', 'comment')
    .leftJoinAndSelect('comment.userCommentId', 'userCommentId') 
    .leftJoinAndSelect('post.author', 'author')
    .leftJoinAndSelect('post.postLiked', 'postLiked') 
    .leftJoinAndSelect('postLiked.user', 'likedUser')
    .where('post.author.id IN (:...followingIds)', { followingIds })    
    .orderBy('post.dateInclude', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

    posts.forEach(p => {
      delete p.author.password;
      p.comments.map(c => {
          delete c.userCommentId.password;
      });         
                     
      p['liked'] = p.postLiked.some(like => like.user.id === Number(userId));
      delete p.postLiked;
  });

    return posts;
  }

  async getTimeLine(userId: number, page: number = 1, limit: number = 10): Promise<Post[]> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoinAndSelect('comment.userCommentId', 'userCommentId')
      .leftJoinAndSelect('post.author', 'author')
      .where('user.id = :userId', { userId })
      .andWhere('user.dateDeleted is null')
      .getOne();
  
    if (!user) {
      return [];
    }
  
    const posts = user.posts || [];
  
    const userPosts = posts
      .slice((page - 1) * limit, page * limit) // Paginação
      .map(post => {
        // Remove a senha do autor, se necessário
        if (post.author) {
          delete post.author.password;
        }
        post.comments.map(comment => {
          delete comment.userCommentId.password;
        });

        return post;
      });
  
    return userPosts;
  }
  

  async createPost(post : PostCreateView): Promise<Post> {    
   
    const user = await this.userRepository.findOne({where: { id: post.userId}});

    if (!user) {
      throw new Error('User not found');
    }

    if(!user.isOng)
      throw new UnauthorizedException('Usuário não possui permissão para criação de posts.'); 

    const newPost = new Post();
    newPost.content = post.content;
    newPost.image = post.image;
    newPost.author = user;

    return this.postRepository.save(newPost);
  }

  async updatePost(postId: number, updateP: PostUpdateView): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['author'] });    

    if (!post) {
      throw new NotFoundException('Post not found');
    }
      
    const user = post.author;
  
    if (user.id !== updateP.userId) {
      throw new UnauthorizedException('Usuário não tem permissão para atualizar este post.');
    }

    const errors = await validate(updateP);

    if (errors.length > 0) {
      throw new Error(`Validation error: ${errors.map(error => Object.values(error.constraints)).join(', ')}`);
    }
  
    post.content = updateP.updatedContent;
    post.image = updateP.updatedImage;
  
    return this.postRepository.save(post);
  }

  async likePost(postId: number, userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId}});
    const post = await this.postRepository.findOne({ where: { id : postId } });          

    if (!user)
      throw new NotFoundException('Not found user')

    if (!post)
      throw new NotFoundException('Not found post')

      const alreadyLiked = await this.likeRepository.findOne({
        where: { user: { id: userId }, post: { id: postId } },
      });
  
      if (!alreadyLiked) {        
        const like = new Liked();
        like.user = user;
        like.post = post;
  
        await this.likeRepository.save(like);
          
        post.likes += 1;
        await this.postRepository.save(post);
      }
  }
  
  
  async unlikePost(postId: number, userId: number): Promise<void> {    
    const like = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });
  
    if (like) {      
      await this.likeRepository.remove(like);
        
      const post = await this.postRepository.findOne({where : { id : postId}});
      if (post && post.likes > 0) {
        post.likes -= 1;
        await this.postRepository.save(post);
      }
    }
  }
  

  async commentPost(postId: number, userCommentId:number, comment: string): Promise<CommentEntity> {
    const post = await this.postRepository.findOne({ where: { id : postId} });

    if(!postId || !userCommentId || !comment)
      throw new BadRequestException('Preencha todos os campos: postId, userCommentId e comment ')

    if (!post) 
      throw new UnauthorizedException('Publicação inexistente');

    const userComment = await this.userRepository.findOne({where: { id: userCommentId }});

      let newComment = new CommentEntity();
      newComment.text = comment;
      newComment.post = post;
      newComment.userCommentId = userComment;

      newComment = await this.commentRepository.save(newComment);    
      delete newComment.post.author.password;

      return newComment;
  }

  async deletePost(postId: number) : Promise<string> { 
      
      await this.postRepository.delete(postId);

      return "Publicação excluida com sucesso"
  }
}
