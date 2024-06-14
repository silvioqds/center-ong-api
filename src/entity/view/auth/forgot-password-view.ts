import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordView {
    @ApiProperty()
    email : string
}