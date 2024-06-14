import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordView{
    @ApiProperty()
    token: string

    @ApiProperty()
    newPassword: string
}