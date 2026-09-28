export const emptyPreferences = { locations: [], types: [], status: '', targetPrice: '', targetArea: '', emailAlerts: false };
export const hasPreferenceCriteria = value => !!(value.locations?.length || value.types?.length || value.status || value.targetPrice || value.targetArea);
