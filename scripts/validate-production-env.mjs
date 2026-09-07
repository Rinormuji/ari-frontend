const requiredVariables = ["VITE_SITE_URL", "VITE_API_BASE_URL"];

const missing = requiredVariables.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  throw new Error(
    `Missing production environment variables: ${missing.join(", ")}.`,
  );
}

const parseProductionOrigin = (key) => {
  const rawValue = process.env[key].trim();
  let url;

  try {
    url = new URL(rawValue);
  } catch {
    throw new Error(`${key} must be a valid absolute URL.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${key} must use HTTPS in production.`);
  }

  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(`${key} must contain only the HTTPS origin, without a path.`);
  }

  const forbidden = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "domaini-final",
    "example.com",
  ];
  if (forbidden.some((value) => url.hostname.toLowerCase().includes(value))) {
    throw new Error(`${key} still contains a local or placeholder hostname.`);
  }

  if (/\.(test|invalid|example|localhost)$/i.test(url.hostname)) {
    throw new Error(`${key} uses a reserved test hostname.`);
  }

  return url.origin;
};

const siteOrigin = parseProductionOrigin("VITE_SITE_URL");
const apiOrigin = parseProductionOrigin("VITE_API_BASE_URL");

if (siteOrigin === apiOrigin) {
  throw new Error("Frontend and API production origins must be different.");
}

console.log(`Production environment validated: ${siteOrigin} -> ${apiOrigin}`);
