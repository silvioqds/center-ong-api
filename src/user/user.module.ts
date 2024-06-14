import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entity/user.entity";
import { Category } from "src/entity/category.entity";
import { CryptoService } from "src/auth/crypto.service";


@Module({    
    imports : [TypeOrmModule.forFeature([User, Category])],
    providers: [UserService, CryptoService],
    controllers: [UserController],        
})

export class UserModule {}
  