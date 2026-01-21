import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envOptions } from '@/config';
import { SupabaseModule } from '@/modules/supabase';
import { SessionModule } from '@/modules/session';

@Module({
  imports: [
    ConfigModule.forRoot(envOptions),
    SupabaseModule,
    SessionModule
  ],
})
export class AppModule { }
