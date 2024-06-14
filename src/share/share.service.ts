import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Post } from "src/entity/post.entity";
import { SharePost } from "src/entity/share.entity";
import { User } from "src/entity/user.entity";
import { LastShare } from "src/entity/view/share/last-share";
import { CreateShare } from "src/entity/view/share/share-create";
import { FeedService } from "src/feed/feed.service";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";


@Injectable()
export class ShareService {
constructor(
    @InjectRepository(SharePost)
    private readonly shareRepository : Repository<SharePost>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository : Repository<Post>
){}

async getShares(userId: number): Promise<SharePost[]> {
   const shares = await this.shareRepository
      .createQueryBuilder('share_post')
      .leftJoinAndSelect('share_post.userShare', 'userShare')
      .leftJoinAndSelect('share_post.post', 'post')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('comment.userCommentId', 'commentUser') 
      .leftJoinAndSelect('post.postLiked', 'postLiked')
      .leftJoinAndSelect('postLiked.user', 'likedUser')
      .where('userShare.id = :userId', { userId })
      .getMany();

    shares.forEach(sh => {
        delete sh.userShare;      
        sh.post.postLiked.forEach(liked => {
           sh['liked'] = liked.user.id === Number(userId)
        })

        delete sh.post.postLiked;
    })    
      
    return shares;
  }
  
async ToShare(createShare : CreateShare) : Promise<SharePost> {    
    
    const { userShareId, postId } = createShare;
    
    const user = await this.userRepository.findOne({where : {id : userShareId}});
    if(!user)
        throw new BadRequestException('User not found');

    const post = await this.postRepository.findOne({where : {id : postId}});
    if(!user)
        throw new BadRequestException('User not found');

    if(post.author.id === user.id)
        throw new BadRequestException('Não é possivel compartilhar sua própria publicação');         
        
    const share = new SharePost();
    delete user.password;
    share.userShare = user;
    delete post.author.password;
    share.post = post;

    return await this.shareRepository.save(share);   
}


async LastShare(createShare : CreateShare) : Promise<LastShare> {

    const { userShareId, postId } = createShare;

    const share = await this.shareRepository.createQueryBuilder('share_post')   
    .where('share_post.userShareId = :userShareId', { userShareId })
    .andWhere('share_post.postId = :postId', { postId })
    .orderBy('share_post.dateInclude', 'DESC')
    .getOne();

    const lastShare = new LastShare()
    if(share){
        lastShare.last_date = share.dateInclude;
    }

    return lastShare;       
}


}