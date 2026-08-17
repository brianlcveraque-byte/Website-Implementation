-- Internal alert when someone submits an inquiry.
--
-- Until now nothing told the team a lead had arrived: public_inquiries was
-- written by the form and read by nothing. The daily digest covers
-- opportunities, tasks, milestones and invoices — internal records only — so a
-- ₱30,000 enquiry could sit unseen until somebody thought to open the table.
--
-- Runs on the same idempotent outbox as every other email: the unique
-- (email_type, related_table, related_id) on email_log is what stops the
-- 5-minute cron re-alerting on the same inquiry forever.

alter table email_log drop constraint email_log_email_type_check;
alter table email_log add constraint email_log_email_type_check
  check (email_type in (
    'inquiry_ack',
    'newsletter_welcome',
    'toolkit_followup',
    'succession_workbook_delivery',
    'succession_nurture',
    'session_seat_confirmation',
    'internal_inquiry_alert'
  ));
