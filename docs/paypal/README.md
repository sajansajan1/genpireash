Cron Jobs for Subscription & Credit Management--

This document provides an overview of the scheduled PostgreSQL cron jobs used to automate subscription lifecycle events and credit renewals in the user_credits table.
These jobs rely on the pg_cron extension.

📌 Prerequisites

Ensure the pg_cron extension is installed and enabled in your PostgreSQL instance:

CREATE EXTENSION IF NOT EXISTS pg_cron;

Jobs run inside the database server and use PostgreSQL’s built-in scheduling syntax (similar to Unix cron).

🕒 Scheduled Jobs Overview

1. Expire Canceled Subscriptions

Runs daily at 3:00 AM

This job automatically expires subscriptions that were previously canceled and whose expiry date is today.

SELECT cron.schedule(
'expire_canceled_subscriptions',
'0 3 \* \* \*',

$$
UPDATE user_credits
SET
  status = 'expired',
  updated_at = NOW()
WHERE
  subscription_status_canceled = true
  AND status = 'active'
  AND expires_at::date = NOW()::date;
$$

);

Purpose

Prevents lingering active status for canceled subscriptions.

Ensures accurate billing and access control.

2. Yearly Membership Manager

Runs daily at 2:00 AM

This job grants credits monthly for users on yearly plans, resetting their credits on the same day of the month as their account creation date.

SELECT cron.schedule(
'yearly-membership-manager',
'0 2 \* \* \*',

$$
UPDATE user_credits
SET
  credits = CASE membership
              WHEN 'pro' THEN 150
              WHEN 'saver' THEN 75
            END,
  updated_at = NOW()
WHERE
  plan_type = 'yearly'
  AND status = 'active'
  AND membership IN ('pro', 'saver')
  AND EXTRACT(DAY FROM created_at) = EXTRACT(DAY FROM NOW());
$$

);

Purpose

Automatically renews monthly credit allocations.

Ensures consistent monthly credit cycles for yearly plans.

3. Monthly Credit Renewal for Pro & Saver Plans

Runs daily at 2:00 AM

This job renews credits for monthly plans and extends their expiry by one billing cycle.

SELECT cron.schedule(
'monthly-credit-renewal-pro-saver',
'0 2 \* \* \*',

$$
UPDATE user_credits
SET
  credits = CASE membership
              WHEN 'pro' THEN 150
              WHEN 'saver' THEN 75
              ELSE credits
            END,
  status = 'active',
  expires_at = (date_trunc('month', expires_at) + interval '1 month'),
  updated_at = NOW()
WHERE
  plan_type = 'monthly'
  AND status = 'active'
  AND membership IN ('pro', 'saver')
  AND expires_at < NOW();
$$

);

Purpose

Automatically renews expired monthly subscriptions.

Prevents user lockout from expiring plans.

Ensures monthly billing cycles advance correctly.

🧹 Managing Cron Jobs
List all cron jobs
SELECT \* FROM cron.job;

Remove a cron job
SELECT cron.unschedule('job_name');

Enable/disable a job
UPDATE cron.job SET active = false WHERE jobname = 'job_name';

📄 Notes

All jobs run inside the database; no external scheduler required.

Timestamps use the server’s timezone.

Ensure user_credits has proper indexes on fields like
status, membership, plan_type, expires_at for performance.
