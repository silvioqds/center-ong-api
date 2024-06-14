import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'impactamba@gmail.com',
          pass: 'ikuv fcxm jpow akym',
        },
      },
      defaults: {
        from: 'impactamba@gmail.com',
      },
      template: {
        dir:  './src/templates',
        adapter: new HandlebarsAdapter(), // Pode usar outro adaptador, como o PugAdapter
        options: {
          strict: true,
        },
      },
    }),
  ],
})

export class MailModule {}
