import { stripMarkdownForPreview } from './markdownPreview';

export type GroupType = 'Working Group' | 'Focus Group';

export type ResearchGroupModel = {
  key: string;
  slug: string;
  name: string;
  type: GroupType;
  description: string;
  tags: string[];
  projects: any[];
  latestProject: any;
};

const FOCUS_KEYWORDS = [
  'health',
  'hci',
  'human',
  'culture',
  'media',
  'education',
  'design',
  'interface',
  'vision',
  'clinical',
];

const DEFAULT_WORKING_GROUPS = [
  'AI & Machine Learning',
  'Neuroergonomics',
  'Algorithmic Social Behaviour',
  'HCI',
  'Tangible User Interfaces',
  'Algorithmic Morality',
  'Edtech',
  'Sonic Interaction Design',
  'New Media',
  'Health Informatics',
  'Space Readiness',
  'Human Dynamics',
  'Futurism & Foresight',
];

export function cleanResearchText(text: string, length = 150) {
  const clean = stripMarkdownForPreview(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Exploring new ideas, methods, and technologies through interdisciplinary research.';
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean;
}

export function titleCase(value: string) {
  return value
    .replace(/^#/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function slugifyResearchGroup(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'research-group';
}

function normalizeGroupName(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ');
}

function canonicalGroupName(value: string) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  const normalized = normalizeGroupName(trimmed);
  if (normalized === 'human computer interaction' || normalized === 'human computer interaction hci' || normalized === 'hci') {
    return 'HCI';
  }

  return titleCase(trimmed);
}

export function groupNameForProject(project: any) {
  const explicit =
    project.researchGroup ||
    project.groupName ||
    project.labName ||
    project.categoryName ||
    project.category ||
    project.group;

  if (typeof explicit === 'string' && explicit.trim()) return canonicalGroupName(explicit);

  const tags = Array.isArray(project.tags) ? project.tags.filter(Boolean) : [];
  const matchingTag = tags.find((tag) => canonicalGroupName(String(tag)) === 'HCI');
  if (matchingTag) return 'HCI';
  if (tags.length) return canonicalGroupName(String(tags[0]));

  const title = String(project.title || 'Interdisciplinary Research').trim();
  return canonicalGroupName(title.split(/[:—-]/)[0].split(' ').slice(0, 3).join(' '));
}

function isDefaultWorkingGroup(name: string) {
  return DEFAULT_WORKING_GROUPS.some(
    (candidate) => normalizeGroupName(candidate) === normalizeGroupName(canonicalGroupName(name)),
  );
}

export function groupTypeForProject(project: any, groupName: string): GroupType {
  const canonicalName = canonicalGroupName(groupName);
  if (canonicalName === 'HCI') return 'Working Group';

  const explicit = String(project.groupType || project.researchGroupType || '').toLowerCase();
  if (explicit.includes('focus')) return 'Focus Group';
  if (explicit.includes('working')) return 'Working Group';
  if (isDefaultWorkingGroup(groupName)) return 'Working Group';

  const searchable = `${groupName} ${(project.tags || []).join(' ')} ${project.title || ''}`.toLowerCase();
  return FOCUS_KEYWORDS.some((keyword) => searchable.includes(keyword))
    ? 'Focus Group'
    : 'Working Group';
}

export function projectTimestamp(project: any) {
  const raw = project.updatedAt || project.publishedAt || project.createdAt || project.date;
  const timestamp = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function makeResearchGroupMonogram(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return letters || 'RG';
}

function groupDescription(name: string, type: GroupType, tags: string[]) {
  const normalizedName = normalizeGroupName(name);
  const topics = tags
    .map((tag) => String(tag).replace(/^#/, '').trim())
    .filter(Boolean)
    .filter((tag) => normalizeGroupName(tag) !== normalizedName)
    .slice(0, 3);

  const topicText = topics.length
    ? ` Its current themes include ${topics.join(', ')}.`
    : '';

  return `${name} is a ${type.toLowerCase()} that brings researchers together around a shared area of investigation.${topicText}`;
}

export function buildResearchGroups(projects: any[]): ResearchGroupModel[] {
  const grouped = new Map<string, any[]>();

  projects.forEach((project) => {
    const name = groupNameForProject(project);
    const key = normalizeGroupName(name);
    const current = grouped.get(key) || [];
    current.push(project);
    grouped.set(key, current);
  });

  const builtGroups = Array.from(grouped.entries()).map(([key, items]) => {
    const sorted = [...items].sort((a, b) => projectTimestamp(b) - projectTimestamp(a));
    const latestProject = sorted[0];
    const name = groupNameForProject(latestProject);
    const type = groupTypeForProject(latestProject, name);
    const allTags = Array.from(
      new Set(sorted.flatMap((item) => (Array.isArray(item.tags) ? item.tags : []))),
    ).slice(0, 8) as string[];

    return {
      key,
      slug: slugifyResearchGroup(name),
      name,
      type,
      description: groupDescription(name, type, allTags),
      tags: allTags,
      projects: sorted,
      latestProject,
    };
  });

  const defaultGroups = DEFAULT_WORKING_GROUPS.map((name) => {
    const existingGroup = builtGroups.find((group) => normalizeGroupName(group.name) === normalizeGroupName(canonicalGroupName(name)));
    if (existingGroup) {
      return {
        ...existingGroup,
        type: 'Working Group' as const,
        description: groupDescription(existingGroup.name, 'Working Group', existingGroup.tags),
      };
    }

    return {
      key: normalizeGroupName(name),
      slug: slugifyResearchGroup(name),
      name,
      type: 'Working Group' as const,
      description: groupDescription(name, 'Working Group', []),
      tags: [],
      projects: [],
      latestProject: null,
    };
  });

  return [...builtGroups, ...defaultGroups.filter((group) => !builtGroups.some((existing) => existing.slug === group.slug))]
    .sort((a, b) => a.name.localeCompare(b.name));
}
