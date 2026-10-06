/* DART Suite — one icon per application.

   The mark an application wears everywhere: its tile on the app rail, its tab,
   and the tag on any Home widget or Today number that comes from it. One place,
   so the rail and Home can never drift apart. On Home, every widget that belongs
   to an application wears that application's mark in its header — all IRM
   widgets the same IRM mark — so you know what a widget is about at a glance.

   IRM is a folder with a check (owner's pick, 2026-10-06): the collection of
   reports it holds, certified — controls, attestations, recertification.
   Jira is not on the rail — it lives outside the suite — but its Home tag
   follows the same rule. */

import type { LucideIcon } from 'lucide-react';
import { FolderCheck, LayoutDashboard, Sparkles, Ticket } from 'lucide-react';

export const APP_ICON: Record<'boards' | 'irm' | 'aiden' | 'jira', LucideIcon> = {
  boards: LayoutDashboard,
  irm: FolderCheck,
  aiden: Sparkles,
  jira: Ticket,
};
