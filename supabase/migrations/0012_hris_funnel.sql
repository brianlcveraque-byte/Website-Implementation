-- The HRIS funnel adds two email types.
--
--   hris_sandbox_welcome — to the person, confirming their session and telling
--                          them their sandbox login follows
--   internal_lead_alert  — to the team, because HRIS sandbox access has to be
--                          provisioned by hand: the HRIS has no multi-tenancy,
--                          so nothing about this signup is automatic
--
-- HRIS signups share the toolkit_leads table with succession workbook
-- downloads, distinguished by toolkit_slug ('hris-sandbox'). The Edge Function
-- filters on that, so neither funnel sends the other funnel's email.

alter table email_log drop constraint email_log_email_type_check;
alter table email_log add constraint email_log_email_type_check
  check (email_type in (
    'inquiry_ack',
    'newsletter_welcome',
    'toolkit_followup',
    'succession_workbook_delivery',
    'succession_nurture',
    'session_seat_confirmation',
    'internal_inquiry_alert',
    'hris_sandbox_welcome',
    'internal_lead_alert'
  ));
