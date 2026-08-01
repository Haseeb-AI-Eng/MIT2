export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

export function isSuperuser(user, defaultAdminEmail = 'admin@example.com') {
  return Boolean(user && user.role === 'admin' && normalizeEmail(user.email) === normalizeEmail(defaultAdminEmail));
}

export function getProjectEditState(user, project, options = {}) {
  const defaultAdminEmail = options.defaultAdminEmail || 'admin@example.com';
  const isOwner = options.isOwner === true;

  if (isSuperuser(user, defaultAdminEmail)) {
    return { canEdit: true, reason: 'superuser' };
  }

  if (!user || user.role !== 'researcher') {
    return { canEdit: false, reason: 'not-authorized' };
  }

  if (!isOwner) {
    return { canEdit: false, reason: 'not-assigned' };
  }

  if (project?.status !== 'published') {
    return { canEdit: true, reason: 'draft-or-review' };
  }

  const publishedAt = project?.publishedAt || project?.updatedAt || project?.createdAt;
  if (!publishedAt) {
    return { canEdit: true, reason: 'no-publish-date' };
  }

  const ageInDays = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000;
  if (ageInDays > 30) {
    return { canEdit: false, reason: 'locked-30-days' };
  }

  return { canEdit: true, reason: 'within-30-days' };
}
