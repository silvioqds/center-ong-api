import { Controller, Get, Post, Body, Param, Query, UseGuards, Put, BadRequestException, Delete, HttpCode } from '@nestjs/common';
import { FeedService } from './feed.service';
import { ApiTags } from '@nestjs/swagger';
import {  Post as PostEntity } from 'src/entity/post.entity';
import { AuthGuard } from '@nestjs/passport';
import { PostCreateView } from 'src/entity/view/post/post-create-view';
import { CommentEntity } from 'src/entity/comment.entity';
import { PostUpdateView } from 'src/entity/view/post/post-update-view';
import { BaseNotification } from 'src/entity/base.notification';

@ApiTags("Feed")
@Controller('feed')
export class FeedController extends BaseNotification {
  constructor(private readonly feedService: FeedService) { super() }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getFeed(@Query('userId') userId: number, @Query('page') page: number, @Query('limit') limit: number) : Promise<PostEntity[]> {
    return  this.feedService.getFeed(userId, page, limit);
  }

  @Get('timeline')
  @UseGuards(AuthGuard('jwt'))
  getTimeLine(@Query('userId') userId: number, @Query('page') page: number, @Query('limit') limit: number) : Promise<PostEntity[]> {
    return  this.feedService.getTimeLine(userId, page, limit);
  }

  @Post(':postId/like')
  @UseGuards(AuthGuard('jwt'))
  likePost(@Param('postId') postId: number, @Body('userId') userId: number) : Promise<void> {
    return this.feedService.likePost(postId, userId);
  }

  @Post(':postId/unlike')
  @UseGuards(AuthGuard('jwt'))
  unlikePost(@Param('postId') postId: number, @Body('userId') userId: number) : Promise<void> {
    return this.feedService.unlikePost(postId, userId);
  }

  @Post(':postId/comment')
  @UseGuards(AuthGuard('jwt'))
  commentPost(@Param('postId') postId: number,  @Body('userCommentId') userCommentId : number, @Body('comment') comment: string)  : Promise<CommentEntity> {
    return this.feedService.commentPost(postId, userCommentId, comment);
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  createPost(@Body() post: PostCreateView) : Promise<PostEntity> {

    this.clearNotifications()
    super.isRequired(post.userId, 'userId é obrigatório')   
    super.hasMaxLen(post.content, 350, 'Máximo de 350 caracteres para content')

    if(!this.valid())
        throw new BadRequestException(this.allNotifications)

    return this.feedService.createPost(post);
  }

  
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(@Param('id') postId: number,@Body() updateP: PostUpdateView) : Promise<PostEntity> {   
    try {
      this.clearNotifications()
      super.isRequired(updateP.userId, 'userId é obrigatório')   
      super.hasMaxLen(updateP.updatedContent, 350, 'Máximo de 350 caracteres para content')

      if(!this.valid())
        throw new BadRequestException(this.allNotifications)

      return await this.feedService.updatePost(postId, updateP);      
    } catch (error) {     
      throw error;
    }
  }

  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async delete(id:number){
    return await this.feedService.deletePost(id);    
  }

}
