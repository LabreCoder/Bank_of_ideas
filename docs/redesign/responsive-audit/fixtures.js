// Fixture data matching backend/app/schemas/*.py response shapes.
const categories = [
  { id: 1, name: "Video", description: "YouTube long-form and shorts" },
  { id: 2, name: "Blog posts and long-form written articles", description: "Written content for the company blog and partner publications, including SEO" },
  { id: 3, name: "Podcast", description: null },
  { id: 4, name: "Social", description: "Instagram, LinkedIn, TikTok" },
  { id: 5, name: "Newsletter", description: "Weekly email" },
  { id: 6, name: "Events", description: "Webinars and live sessions" },
];
const owners = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Maria Fernanda de Albuquerque Cavalcanti" },
  { id: 3, name: "João Victor" },
  { id: 4, name: "Bob" },
];
const cat = (id) => categories.find((c) => c.id === id) || null;
const own = (id) => owners.find((o) => o.id === id);

const ideaDefs = [
  [1, "Quick tips", "Short", 1, 1, true],
  [2, "A comprehensive, deeply researched guide to building sustainable content calendars for small marketing teams in 2027", "This description is intentionally long so that we can see how cards and detail panels wrap text that spans several lines on narrow screens without clipping.", 2, 2, true],
  [3, "Interview series with industry leaders", "Monthly interview with someone relevant in the field.", 3, 3, true],
  [4, "Behind the scenes reel", null, 4, 1, true],
  [5, "Supercalifragilisticexpialidocious_unbreakable_identifier_name_without_spaces", "Unbreakable word test: averyveryverylongwordwithoutanyspacesatalltoforceoverflowinnarrowcontainers", 1, 4, true],
  [6, "Year in review newsletter", "End of year recap for subscribers.", 5, 2, true],
  [7, "Product launch webinar", "Live webinar with Q&A for the new release.", 6, 3, true],
  [8, "Customer success stories", "Case studies from three customers.", 2, 1, true],
  [9, "Archived experiment idea", "Old idea, inactive.", null, 4, false],
  [10, "Carousel: 10 mistakes to avoid", "LinkedIn carousel.", 4, 2, true],
  [11, "Podcast mini-season on accessibility", "Five episodes about accessible design and content.", 3, 3, true],
  [12, "Uncategorized brainstorm", null, null, 1, true],
];

const plannedIdeaIds = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
const ideas = ideaDefs.map(([id, name, description, catId, ownerId, active], i) => ({
  id, name, description,
  category: catId ? cat(catId) : null,
  owner: own(ownerId),
  is_active: active,
  created_at: `2026-${String(8 + (i % 4)).padStart(2, "0")}-${String(1 + i).padStart(2, "0")}T10:00:00`,
  execution_status: plannedIdeaIds.has(id) ? "In Planning" : "Free",
}));
const ideaSummary = (id) => {
  const i = ideas.find((x) => x.id === id);
  return { id: i.id, name: i.name, category: i.category, owner: i.owner, is_active: i.is_active };
};

let itemId = 100;
const items = (list) => list.map(([description, due_date, is_done], position) => ({ id: itemId++, description, due_date, is_done, position }));

const plannings = [
  { id: 1, idea: ideaSummary(1), details: "Record 5 shorts", start_date: "2026-11-10", due_date: "2026-11-22", status: "In Development", created_at: "2026-11-01T10:00:00",
    checklist_items: items([["Write script", "2026-11-15", true], ["Record", "2026-11-18", true], ["Edit and publish the final cut with captions in three languages", "2026-11-21", false]]) },
  { id: 2, idea: ideaSummary(2), details: "A very long details text. ".repeat(12), start_date: "2026-11-01", due_date: "2026-11-24", status: "Started", created_at: "2026-10-20T10:00:00",
    checklist_items: items([["Outline", "2026-11-05", true], ["Draft chapter 1", "2026-11-12", true], ["Draft chapter 2", "2026-11-19", false], ["Review with stakeholders from marketing, sales and product", "2026-11-23", false], ["Publish", "2026-11-24", false]]) },
  { id: 3, idea: ideaSummary(3), details: "Book guests", start_date: "2026-11-15", due_date: "2026-11-24", status: "Under Review", created_at: "2026-11-02T10:00:00",
    checklist_items: items([["Guest list", "2026-11-16", true], ["Send invites", null, false]]) },
  { id: 4, idea: ideaSummary(4), details: null, start_date: "2026-11-20", due_date: "2026-11-26", status: "Not Started", created_at: "2026-11-03T10:00:00",
    checklist_items: [] },
  { id: 5, idea: ideaSummary(5), details: "averyveryverylongwordwithoutanyspacesatalltoforceoverflowinnarrowcontainers_details", start_date: "2026-11-18", due_date: "2026-11-28", status: "Started", created_at: "2026-11-04T10:00:00",
    checklist_items: items([["Unbreakable_checklist_item_description_without_any_spaces_to_test_wrapping", "2026-11-27", false]]) },
  { id: 6, idea: ideaSummary(6), details: "Recap", start_date: "2026-12-01", due_date: "2026-12-15", status: "Not Started", created_at: "2026-11-05T10:00:00",
    checklist_items: items([["Collect metrics", "2026-12-05", false], ["Write", "2026-12-10", false]]) },
  { id: 7, idea: ideaSummary(7), details: "Webinar", start_date: "2026-10-01", due_date: "2026-11-05", status: "Completed", created_at: "2026-09-25T10:00:00",
    checklist_items: items([["Slides", "2026-10-20", true], ["Rehearsal", "2026-11-01", true]]) },
  { id: 8, idea: ideaSummary(8), details: "Cases", start_date: "2026-11-01", due_date: "2026-11-22", status: "Cancelled", created_at: "2026-10-28T10:00:00",
    checklist_items: items([["Contact customers", "2026-11-10", false]]) },
];

const P = (id) => plannings.find((p) => p.id === id);
const cycles = [
  { id: 1, name: "Q4 Sprint — Holiday content push across all channels with extended name", description: "Everything we publish between November and mid-December, including the newsletter and the podcast mini season.", start_date: "2026-11-01", due_date: "2026-12-20", status: "In Progress", is_overdue: false, completed_plannings: 0, total_plannings: 4, progress_percentage: 0, created_at: "2026-10-25T10:00:00", plannings: [P(1), P(2), P(3), P(6)] },
  { id: 2, name: "Launch", description: null, start_date: "2026-12-01", due_date: null, status: "Waiting Start", is_overdue: false, completed_plannings: 0, total_plannings: 1, progress_percentage: 0, created_at: "2026-11-10T10:00:00", plannings: [P(4)] },
  { id: 3, name: "October webinar cycle", description: "Finished.", start_date: "2026-10-01", due_date: "2026-11-10", status: "Finished", is_overdue: false, completed_plannings: 1, total_plannings: 2, progress_percentage: 100, created_at: "2026-09-20T10:00:00", plannings: [P(7), P(8)] },
];

module.exports = { categories, owners, ideas, plannings, cycles };
