export const getSafeRedirect = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;
export const paths = {
  home: "/",
  propertiesMap: "/properties",
  properties: "/properties/all",
  propertyDetail: (id = ":id") => `/properties/${id}`,
  about: "/about",
  contact: "/contact",
  appointment: "/appointment",
  appointmentForProperty: (propertyId) => `/appointment?propertyId=${propertyId}`,
  myAppointments: "/my-appointments",
  profile: "/profile",
  login: "/login",
  loginWithRedirect: (redirectTo) => `/login?redirect=${encodeURIComponent(redirectTo)}`,
  register: "/register",
  verify: "/verify",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  oauthRedirect: "/oauth2/redirect",
  admin: "/admin",
  adminProperties: "/admin/properties",
  adminPropertyAdd: "/admin/properties/add",
  adminPropertyEdit: (id = ":id") => `/admin/properties/edit/${id}`,
  adminUsers: "/admin/users",
  adminAppointments: "/admin/appointments",
};
