-- Read-only live regression checks. Every result must be true.
SELECT
  NOT has_function_privilege('anon', 'public.claim_first_admin()', 'EXECUTE') AS anonymous_cannot_claim,
  NOT has_function_privilege('authenticated', 'public.claim_first_admin()', 'EXECUTE') AS ordinary_user_cannot_claim,
  NOT has_table_privilege('authenticated', 'public.admin_users', 'INSERT') AS ordinary_user_cannot_assign,
  NOT has_table_privilege('authenticated', 'public.admin_users', 'UPDATE') AS ordinary_user_cannot_promote,
  NOT has_table_privilege('anon', 'public.admin_users', 'INSERT') AS anonymous_cannot_assign,
  has_table_privilege('service_role', 'public.admin_users', 'INSERT') AS privileged_management_can_assign;