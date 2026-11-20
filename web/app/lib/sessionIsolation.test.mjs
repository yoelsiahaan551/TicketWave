import test from "node:test";
import assert from "node:assert/strict";

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    keys() {
      return [...store.keys()];
    },
  };
}

function installBrowserMocks() {
  const listeners = new Map();
  const dispatched = [];
  const sessionStorage = createMemoryStorage();
  const localStorage = createMemoryStorage();

  globalThis.sessionStorage = sessionStorage;
  globalThis.localStorage = localStorage;
  if (typeof globalThis.Event !== "function") {
    globalThis.Event = class MockEvent {
      constructor(type) {
        this.type = type;
      }
    };
  }
  globalThis.window = {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      listeners.get(type)?.delete(fn);
    },
    dispatchEvent(event) {
      dispatched.push(event.type);
      for (const fn of listeners.get(event.type) || []) {
        fn(event);
      }
      return true;
    },
  };

  return { sessionStorage, localStorage, dispatched };
}

const mocks = installBrowserMocks();

const { default: api } = await import("./api.js");
const {
  savePaymentReturnContext,
  readPaymentReturnContext,
  clearPaymentReturnContext,
  isBookingOwnedByUser,
  isPendingSessionExpired,
  normalizeUtcIso,
} = await import("./paymentContext.js");
const { resolvePostLoginRedirect } = await import("./authRedirect.js");

function resetMocks() {
  mocks.sessionStorage.clear();
  mocks.localStorage.clear();
  mocks.dispatched.length = 0;
}

test("api.setSession isolates Remember-me Officer and non-Remember-me User cleanly", () => {
  resetMocks();

  api.setSession({
    accessToken: "tok-officer-test",
    refreshToken: "ref-officer-test",
    userData: { id: 2, email: "officer@ticketwave.com", role: "officer" },
    remember: true,
  });
  mocks.sessionStorage.setItem("ticketwave_checkout", "{\"eventId\":5}");
  savePaymentReturnContext({
    booking_code: "TKTW-20261120-OLD001",
    owner_user_id: 2,
    owner_email: "officer@ticketwave.com",
  });

  assert.equal(mocks.localStorage.getItem("access_token"), "tok-officer-test");
  assert.equal(mocks.sessionStorage.getItem("access_token"), null);

  api.setSession({
    accessToken: "tok-user-test",
    refreshToken: "ref-user-test",
    userData: { id: 3, email: "user@example.com", role: "user" },
    remember: false,
  });

  assert.equal(mocks.localStorage.getItem("access_token"), null);
  assert.equal(mocks.localStorage.getItem("refresh_token"), null);
  assert.equal(mocks.localStorage.getItem("user"), null);
  assert.equal(mocks.localStorage.getItem("ticketwave_checkout"), null);
  assert.equal(mocks.localStorage.getItem("ticketwave_payment_return_context"), null);
  assert.equal(mocks.sessionStorage.getItem("ticketwave_checkout"), null);
  assert.equal(mocks.sessionStorage.getItem("ticketwave_payment_return_context"), null);
  assert.equal(mocks.sessionStorage.getItem("access_token"), "tok-user-test");
  assert.equal(mocks.sessionStorage.getItem("refresh_token"), "ref-user-test");
  assert.equal(JSON.parse(mocks.sessionStorage.getItem("user")).role, "user");
});

test("api.clearTokens purges both stores and dispatches ticketwave:session-cleared", () => {
  resetMocks();
  mocks.localStorage.setItem("access_token", "a");
  mocks.localStorage.setItem("refresh_token", "b");
  mocks.localStorage.setItem("user", "{\"role\":\"admin\"}");
  mocks.sessionStorage.setItem("ticketwave_checkout", "{}");
  mocks.sessionStorage.setItem("ticketwave_payment_return_context", "{}");

  api.clearTokens();

  assert.deepEqual(mocks.localStorage.keys(), []);
  assert.deepEqual(mocks.sessionStorage.keys(), []);
  assert.deepEqual(mocks.dispatched, ["ticketwave:session-cleared"]);
});

test("subscribeSessionCleared ignores external localStorage overwrite when tab holds sessionStorage session", () => {
  resetMocks();
  let clearedCount = 0;
  let externalChangedCount = 0;

  api.setSession({
    accessToken: "tok-tab-user",
    refreshToken: "ref-tab-user",
    userData: { id: 3, email: "user@example.com", role: "user" },
    remember: false,
  });

  const unsub = api.subscribeSessionCleared(
    () => {
      clearedCount++;
    },
    () => {
      externalChangedCount++;
    }
  );

  // Simulate another tab writing an Officer token to localStorage
  mocks.localStorage.setItem("access_token", "tok-other-tab-officer");
  globalThis.window.dispatchEvent({
    type: "storage",
    storageArea: mocks.localStorage,
    key: "access_token",
    newValue: "tok-other-tab-officer",
  });

  assert.equal(clearedCount, 0);
  assert.equal(externalChangedCount, 0);

  // Now simulate localStorage-based tab detecting external overwrite
  mocks.sessionStorage.clear();
  globalThis.window.dispatchEvent({
    type: "storage",
    storageArea: mocks.localStorage,
    key: "access_token",
    newValue: "tok-other-tab-admin",
  });
  assert.equal(externalChangedCount, 1);

  unsub();
});

test("paymentContext stores only non-secret fields and validates ownership cleanly", () => {
  resetMocks();
  savePaymentReturnContext({
    booking_code: "tktw-20261120-84ba9b",
    return_path: "/user/pesanan/TKTW-20261120-84BA9B?payment_return=1",
    owner_user_id: 3,
    owner_email: "USER@Example.com",
  });

  const ctx = readPaymentReturnContext("TKTW-20261120-84BA9B");
  assert.deepEqual(
    Object.keys(ctx).sort(),
    ["booking_code", "owner_email", "owner_user_id", "return_path", "timestamp"]
  );
  assert.equal(ctx.booking_code, "TKTW-20261120-84BA9B");
  assert.equal(ctx.owner_email, "user@example.com");

  const booking = { user_id: 3, buyer_email: "user@example.com", status: "pending_payment", expired_at: "2099-01-01T00:00:00" };
  assert.equal(isBookingOwnedByUser(booking, { id: 3, email: "user@example.com", role: "user" }), true);
  assert.equal(isBookingOwnedByUser(booking, { id: 9, email: "other@example.com", role: "user" }), false);
  assert.equal(isBookingOwnedByUser(booking, { id: 2, email: "officer@ticketwave.com", role: "officer" }), false);
  assert.equal(isBookingOwnedByUser(booking, { id: 1, email: "admin@ticketwave.com", role: "admin" }), true);

  assert.equal(normalizeUtcIso("2026-11-20T06:40:20"), "2026-11-20T06:40:20Z");
  assert.equal(normalizeUtcIso("2026-11-20T06:40:20Z"), "2026-11-20T06:40:20Z");
  assert.equal(isPendingSessionExpired(booking), false);
  assert.equal(
    isPendingSessionExpired({ ...booking, expired_at: "2020-01-01T00:00:00" }),
    true
  );

  clearPaymentReturnContext();
  assert.equal(readPaymentReturnContext(), null);
});

test("resolvePostLoginRedirect isolates roles and rejects unsafe/open-redirect paths", () => {
  assert.equal(
    resolvePostLoginRedirect("user", "/user/pesanan/TKTW-20261120-84BA9B?payment_return=1"),
    "/user/pesanan/TKTW-20261120-84BA9B?payment_return=1"
  );
  assert.equal(
    resolvePostLoginRedirect("user", "/payment/finish?booking_code=TKTW-20261120-84BA9B"),
    "/payment/finish?booking_code=TKTW-20261120-84BA9B"
  );
  assert.equal(resolvePostLoginRedirect("user", "/officer/scan"), "/user/home");
  assert.equal(resolvePostLoginRedirect("user", "/admin"), "/user/home");
  assert.equal(resolvePostLoginRedirect("officer", "/user/pesanan/TKTW-1"), "/officer");
  assert.equal(resolvePostLoginRedirect("officer", "/officer/validation?code=TKT-1"), "/officer/validation?code=TKT-1");
  assert.equal(resolvePostLoginRedirect("admin", "/officer"), "/admin");
  assert.equal(resolvePostLoginRedirect("admin", "/admin/event/5"), "/admin/event/5");
  assert.equal(resolvePostLoginRedirect("user", "//evil.example/phish"), "/user/home");
  assert.equal(resolvePostLoginRedirect("user", "/login?next=/user/home"), "/user/home");
  assert.equal(resolvePostLoginRedirect("user", "/register"), "/user/home");
});
