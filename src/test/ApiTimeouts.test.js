import { afterEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import api, { propertyAPI, PROPERTY_SAVE_TIMEOUT_MS } from "../services/api";

const originalAdapter = api.defaults.adapter;
afterEach(() => { api.defaults.adapter = originalAdapter; });

describe("API requests on slow connections", () => {
  it("allows more time for property saves", async () => {
    const adapter = vi.fn(async (config) => ({ data: {}, status: 200, statusText: "OK", headers: {}, config }));
    api.defaults.adapter = adapter;

    await propertyAPI.createProperty({ id: 123 });

    expect(adapter).toHaveBeenCalledOnce();
    expect(adapter.mock.calls[0][0].timeout).toBe(PROPERTY_SAVE_TIMEOUT_MS);
  });

  it("retries a timed out read once and does not repeat a failed write", async () => {
    let readAttempts = 0;
    const adapter = async (config) => {
      readAttempts++;
      if (readAttempts === 1) throw new AxiosError("timeout", "ECONNABORTED", config);
      return { data: [], status: 200, statusText: "OK", headers: {}, config };
    };

    await api.get("/cities", { adapter });
    expect(readAttempts).toBe(2);

    let writeAttempts = 0;
    await expect(api.post("/properties", {}, { adapter: async (config) => {
      writeAttempts++;
      throw new AxiosError("timeout", "ECONNABORTED", config);
    } })).rejects.toMatchObject({ code: "ECONNABORTED" });
    expect(writeAttempts).toBe(1);
  });
});
