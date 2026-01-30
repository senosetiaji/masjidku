export function setActiveMenu(menu, currentUrl) {
  // Normalize paths: remove trailing slashes for consistent comparison
  const normalize = (path) => (path || '').replace(/\/+$/, '');
  const current = normalize(currentUrl);

  return menu.map((item) => {
    const itemLink = normalize(item.link);

    const submenu = (item.submenu || []).map((sub) => {
      const subLink = normalize(sub.link);
      // If submenu link equals parent link, only exact match should activate it
      const isParentLink = subLink === itemLink;
      // Otherwise, allow nested routes under the submenu to keep it active
      const subActive = isParentLink
        ? current === subLink
        : current === subLink || current.startsWith(subLink + '/');
      return {
        ...sub,
        isActive: subActive,
        icon: sub.icon,
      };
    });

    // Parent item is active only on exact match (not when a submenu is active)
    const itemActive = current === itemLink;

    return {
      ...item,
      isActive: itemActive,
      submenu,
    };
  });
}