/* DART Central — Jira tickets.

   Jira lives outside the suite: a ticket always opens in Jira itself, in a new browser tab, and nothing
   here is in the suite's store or its routes. The suite only READS "assigned to me" and shows it where a
   person tracks their work — Home (a widget and a Today number) and Open items, where a ticket sits under
   the IRM request it was opened for (owner, 2026-10-06: a developer opens Jira tickets from the BRD of the
   IRM request they were assigned, so the ticket names that request).

   Mock data, as if read from each person's "assigned to me" filter: every ticket has one assignee and
   shows for that person only (owner, 2026-10-06). Developers hold the build work; the business owner
   holds UAT sign-off on their own requests; production support, the manager and governance hold their
   own tasks — so every persona's Home and Open items show their tickets and nobody else's. */

export type JiraStatus = 'To Do' | 'In Progress' | 'In Review' | 'Blocked';
export type JiraPriority = 'Highest' | 'High' | 'Medium' | 'Low';
export type JiraType = 'Bug' | 'Story' | 'Task';

export type JiraTicket = {
  key: string;
  summary: string;
  type: JiraType;
  status: JiraStatus;
  priority: JiraPriority;
  project: string;
  /** ISO date. */
  updated: string;
  /** ISO date, when there is one. */
  due?: string;
  /** Whose ticket it is — the only person it shows for. */
  assigneeId: string;
  /** The IRM request it was opened for ("CHG-1046"), when it was. */
  irm?: string;
};

/** Where Jira lives. A ticket opens at `${JIRA_URL}/browse/${key}`. */
export const JIRA_URL = 'https://jira.example.com';
export const jiraLink = (key?: string) => (key ? `${JIRA_URL}/browse/${key}` : `${JIRA_URL}/issues/?filter=-1`);
export const openInJira = (key?: string) => window.open(jiraLink(key), '_blank', 'noopener,noreferrer');

export const JIRA_TICKETS: JiraTicket[] = [
  // Kahrman McKenzie (business owner): UAT sign-off on the two requests he raised.
  { key: 'DART-883', summary: 'UAT: check the region-by-segment drill against finance numbers', type: 'Task', status: 'To Do', priority: 'Medium', project: 'DART', updated: '2026-10-05', due: '2026-10-12', assigneeId: 'u-km', irm: 'CHG-1040' },
  { key: 'DART-875', summary: 'UAT: confirm Pipeline Health no longer double-counts slipped deals', type: 'Task', status: 'In Progress', priority: 'High', project: 'DART', updated: '2026-10-05', due: '2026-10-08', assigneeId: 'u-km', irm: 'CHG-1041' },
  // Jordan Mount (developer): the tickets he opened from the BRD of the IRM requests he was assigned.
  { key: 'DART-890', summary: 'Agency Placement Tracker: build the placement fact table', type: 'Story', status: 'In Progress', priority: 'High', project: 'DART', updated: '2026-10-05', due: '2026-10-09', assigneeId: 'u-jm', irm: 'CHG-1046' },
  { key: 'DART-891', summary: 'Agency Placement Tracker: recovery rate by agency and month', type: 'Story', status: 'To Do', priority: 'Medium', project: 'DART', updated: '2026-10-03', due: '2026-10-14', assigneeId: 'u-jm', irm: 'CHG-1046' },
  { key: 'DART-892', summary: 'Agency Placement Tracker: placement filters from the BRD', type: 'Task', status: 'To Do', priority: 'Medium', project: 'DART', updated: '2026-10-03', due: '2026-10-16', assigneeId: 'u-jm', irm: 'CHG-1046' },
  { key: 'DART-886', summary: 'Promise-kept rate: add the measure to Collections Performance', type: 'Story', status: 'In Review', priority: 'Medium', project: 'DART', updated: '2026-10-04', assigneeId: 'u-jm', irm: 'CHG-1045' },
  { key: 'DART-881', summary: 'Add the segment dimension for the Revenue by Region drill', type: 'Story', status: 'In Progress', priority: 'High', project: 'DART', updated: '2026-10-06', due: '2026-10-10', assigneeId: 'u-jm', irm: 'CHG-1040' },
  // Dana Wu (developer): the Pipeline Health fix, and the feed that blocks Branch Traffic Daily.
  { key: 'DART-874', summary: 'Pipeline Health double-counts slipped deals', type: 'Bug', status: 'In Review', priority: 'High', project: 'DART', updated: '2026-10-04', assigneeId: 'u-dw', irm: 'CHG-1041' },
  { key: 'DATA-2214', summary: 'Branch footfall feed misses Saturday loads', type: 'Bug', status: 'Blocked', priority: 'Highest', project: 'Data Platform', updated: '2026-10-05', due: '2026-10-07', assigneeId: 'u-dw' },
  // Sam Okafor (developer): clean-up after the Marketing Funnel change.
  { key: 'DART-859', summary: 'Retire the old Marketing Funnel extract', type: 'Task', status: 'To Do', priority: 'Low', project: 'DART', updated: '2026-09-29', assigneeId: 'u-so' },
  // Leo Grant (developer).
  { key: 'RPT-398', summary: 'Churn Risk model inputs for Q4 review', type: 'Story', status: 'In Progress', priority: 'Medium', project: 'Reporting', updated: '2026-10-01', due: '2026-10-20', assigneeId: 'u-lg' },
  // Chris Bauer (production support).
  { key: 'RPT-412', summary: 'Document the Collections Daily refresh schedule', type: 'Task', status: 'To Do', priority: 'Medium', project: 'Reporting', updated: '2026-10-02', due: '2026-10-16', assigneeId: 'u-cb' },
  { key: 'OPS-118', summary: 'Weekend deploy window for the Servicing SLA fix', type: 'Task', status: 'To Do', priority: 'High', project: 'Operations', updated: '2026-10-05', due: '2026-10-10', assigneeId: 'u-cb', irm: 'CHG-1054' },
  // Alex Rivera (development manager).
  { key: 'DART-900', summary: 'Size the Q4 report backlog for sprint planning', type: 'Task', status: 'To Do', priority: 'Medium', project: 'DART', updated: '2026-10-02', due: '2026-10-13', assigneeId: 'u-ar' },
  // Nina Patel (governance).
  { key: 'GRC-57', summary: 'Collect Q3 access-review evidence for the audit', type: 'Task', status: 'In Progress', priority: 'High', project: 'Governance', updated: '2026-10-04', due: '2026-10-15', assigneeId: 'u-np' },
];

export const JIRA_STATUS_TONE: Record<JiraStatus, 'default' | 'warning' | 'error' | 'success'> = {
  'To Do': 'default',
  'In Progress': 'default',
  'In Review': 'success',
  Blocked: 'error',
};

const PRIORITY_RANK: Record<JiraPriority, number> = { Highest: 0, High: 1, Medium: 2, Low: 3 };

/** The person's open tickets: blocked first, then by priority. */
export const myJiraTickets = (personId: string) =>
  JIRA_TICKETS.filter((t) => t.assigneeId === personId).sort((a, b) => Number(b.status === 'Blocked') - Number(a.status === 'Blocked') || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

export const isUrgent = (t: JiraTicket) => t.status === 'Blocked' || t.priority === 'Highest' || t.priority === 'High';
