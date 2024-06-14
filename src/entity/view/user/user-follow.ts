import { ApiProperty } from "@nestjs/swagger"

export class UserFollow {
    @ApiProperty()
    userId: number

    @ApiProperty()
    followerId:number
}