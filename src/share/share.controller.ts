import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseNotification } from "src/entity/base.notification";
import { SharePost } from "src/entity/share.entity";
import { ShareService } from "./share.service";
import { CreateShare } from "src/entity/view/share/share-create";
import { AuthGuard } from "@nestjs/passport";
import { LastShare } from "src/entity/view/share/last-share";

@ApiTags('Share')
@Controller('share')
export class ShareController extends BaseNotification {

constructor(private readonly service: ShareService){
    super()
}


@Get(':userId')
@UseGuards(AuthGuard('jwt'))
async getShares(@Param('userId') userId : string) : Promise<SharePost[]> {
    return await this.service.getShares(Number(userId));
}

@Post('share')
@UseGuards(AuthGuard('jwt'))
async Share(@Body() create: CreateShare) : Promise<SharePost> {
    return await this.service.ToShare(create);
}

@Post('lastshare')
@UseGuards(AuthGuard('jwt'))
async LastShare(@Body() create: CreateShare) : Promise<LastShare> {
    return await this.service.LastShare(create);
}

}