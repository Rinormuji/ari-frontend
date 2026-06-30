const viewKeys = ["views", "viewCount", "viewsCount", "visitCount", "visits"];

export const getPropertyViews = (property) => {
  if (!property) return 0;

  const value = viewKeys
    .map((key) => property[key])
    .find((candidate) => candidate !== undefined && candidate !== null);

  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
};

export const formatPropertyViews = (property) =>
  getPropertyViews(property).toLocaleString();
