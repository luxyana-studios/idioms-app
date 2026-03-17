Walk through adding a new Supabase table to the app.

Arguments: `<tableName>` (the Supabase table name, e.g., `profiles` or `posts`)

Parse "$ARGUMENTS" to get the table name.

## Steps

1. **Ask me** what columns the table has (or if I want to describe it in plain English). I need this to generate the correct TypeScript types and query functions.

2. **Update database types** in `src/types/supabase.ts`:
   - Add the table's Row type to the Database interface
   - Follow the existing Supabase generated types pattern
   - Remind me to run `npx supabase gen types typescript` later to get the real generated types

3. **Create a query hook** in the appropriate feature directory:
   - Use React Query (`useQuery` / `useMutation` from `@tanstack/react-query`)
   - Import the supabase client from `@/core/supabase/client`
   - Use typed queries: `supabase.from("<tableName>").select()`
   - Export hooks like `use<TableName>Query()` and `use<TableName>Mutation()` as needed

4. **Remind me about**:
   - Setting up RLS (Row Level Security) policies on the table
   - Running `npx supabase gen types typescript` to regenerate types from the live schema
   - Adding the Supabase URL and anon key to `.env` if not already done

## Conventions
- Follow the patterns in `src/core/CLAUDE.md` and `src/features/CLAUDE.md`
- React Query keys should be descriptive: `["<tableName>", ...params]`
- Error handling: let React Query handle errors — don't try/catch in query functions
