-- Storage bucket + policies for uploaded documents (TECH_DESIGN.md §9).
-- Objects are stored at `${entityType}/${entityId}/${timestamp}-${filename}`.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_bucket_core_full_access" on storage.objects for all
  using (bucket_id = 'documents' and current_user_role() in ('owner','core_team'))
  with check (bucket_id = 'documents' and current_user_role() in ('owner','core_team'));

-- A temp consultant may only read files uploaded under project/<a project they're assigned to>/...
create policy "documents_bucket_temp_view_assigned" on storage.objects for select
  using (
    bucket_id = 'documents'
    and current_user_role() = 'temp_consultant'
    and (storage.foldername(name))[1] = 'project'
    and exists (
      select 1 from project_assignments pa
      left join consultants c on c.id = pa.consultant_id
      where pa.project_id::text = (storage.foldername(name))[2]
        and (pa.user_id = auth.uid() or c.linked_user_id = auth.uid())
    )
  );
