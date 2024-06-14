import { ApiProperty } from "@nestjs/swagger";

export class CreateShare {

    @ApiProperty()
    userShareId : number

    @ApiProperty()
    postId: number
}