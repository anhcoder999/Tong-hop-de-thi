alter table public.profiles add column if not exists ho_ten text;
create or replace function public.guard_profile_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null then
    if new.role is distinct from old.role then
      raise exception 'Khong duoc tu thay doi vai tro';
    end if;
    new.email := old.email;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard before update on public.profiles
for each row execute function public.guard_profile_role();
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
using (auth.uid() = id) with check (auth.uid() = id);