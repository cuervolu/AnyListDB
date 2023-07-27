import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from 'src/users/users.module';
import { ItemsModule } from 'src/items/items.module';

import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [ConfigModule, UsersModule, ItemsModule],
})
export class SeedModule {}
