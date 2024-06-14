import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharePost } from "src/entity/share.entity";
import { ShareController } from "./share.controller";
import { ShareService } from "./share.service";
import { User } from "src/entity/user.entity";
import { Post } from "src/entity/post.entity";


@Module({
    imports: [TypeOrmModule.forFeature([SharePost, User, Post])],
    controllers: [ShareController],
    providers: [ShareService]
})

export class ShareModule {};