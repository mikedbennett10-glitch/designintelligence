// GENERATED FILE — do not hand-edit.
//
// Regenerate after every migration with:
//   supabase gen types typescript --local > src/lib/types/database.ts
//
// This stub exists so the project type-checks before Supabase is connected.
// It is replaced wholesale by the CLI output.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends string> = Record<string, unknown> & { __table: T };
