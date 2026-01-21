import { Module, Global } from '@nestjs/common';
import { SupabaseProvider } from './supabase.provider';

@Global()
@Module({
    providers: [SupabaseProvider],
    exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule { }