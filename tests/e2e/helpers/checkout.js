import { DEMO_EMAIL } from "./auth.js";

const API_BASE = (process.env.API_BASE || "http://localhost:3001/v1").replace(/\/$/, "");
const PRODUCT_SLUG = process.env.PDP_SLUG || "tiger-10w30-sl-fully-synthetic";

async function readSession(page) {
  return page.evaluate(() => ({
    cartId: window.localStorage.getItem("bt_cart_id"),
    token: window.localStorage.getItem("bt_access_token"),
  }));
}

/** Create a cart with one line via API and store cart id in localStorage. */
export async function seedCartWithItemViaApi(page) {
  const session = await readSession(page);
  if (!session.token) {
    throw new Error("seedCartWithItemViaApi requires an authenticated session");
  }
  const headers = { Authorization: `Bearer ${session.token}` };

  const prodRes = await page.request.get(`${API_BASE}/catalog/products/${encodeURIComponent(PRODUCT_SLUG)}`);
  if (!prodRes.ok()) {
    throw new Error(`product HTTP ${prodRes.status()}: ${await prodRes.text()}`);
  }
  const product = (await prodRes.json())?.data ?? (await prodRes.json());
  const pkgs = Array.isArray(product?.packagingOptions) ? product.packagingOptions : [];
  const pkg = pkgs.find((p) => p?.default) ?? pkgs[0];
  if (!pkg?.id) {
    throw new Error(`No packaging option on ${PRODUCT_SLUG}`);
  }

  const cartRes = await page.request.post(`${API_BASE}/cart`, {
    headers,
    data: {},
  });
  if (!cartRes.ok()) {
    throw new Error(`create cart HTTP ${cartRes.status()}: ${await cartRes.text()}`);
  }
  const cart = (await cartRes.json())?.data ?? (await cartRes.json());
  const cartId = cart?.id;
  if (!cartId) throw new Error("create cart missing id");

  const addRes = await page.request.post(`${API_BASE}/cart/${encodeURIComponent(cartId)}/items`, {
    headers,
    data: {
      productSlug: PRODUCT_SLUG,
      packagingOptionId: pkg.id,
      quantity: 1,
      palletType: "unit",
    },
  });
  if (!addRes.ok()) {
    throw new Error(`add cart item HTTP ${addRes.status()}: ${await addRes.text()}`);
  }

  await page.evaluate((id) => {
    window.localStorage.setItem("bt_cart_id", id);
  }, cartId);

  await page.goto("/cart", { waitUntil: "networkidle" });
  return { cartId, token: session.token };
}

/** Wait until local cart id resolves to a cart with line items. */
export async function waitForStableCart(page) {
  await page.waitForLoadState("networkidle");
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const session = await readSession(page);
    if (session.cartId && session.token) {
      const res = await page.request.get(`${API_BASE}/cart/${encodeURIComponent(session.cartId)}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok()) {
        const body = await res.json();
        const cart = body?.data ?? body;
        if (Array.isArray(cart?.items) && cart.items.length > 0) {
          return session;
        }
      }
    }
    await page.waitForTimeout(500);
  }
  throw new Error("Cart with items not ready for checkout");
}

/** Save checkout address via API (stable setup for shipping/payment UI steps). */
export async function seedCheckoutAddressViaApi(page) {
  const session = await waitForStableCart(page);

  const res = await page.request.put(
    `${API_BASE}/checkout/${encodeURIComponent(session.cartId)}/address`,
    {
      headers: { Authorization: `Bearer ${session.token}` },
      data: {
        shippingAddress: {
          countryCode: "SA",
          addressLine1: "3462 Old Al-Kharj Road",
          city: "Riyadh",
          postalCode: "11564",
          usageTypes: ["shipping", "billing"],
          label: "Office",
        },
        billingSameAsShipping: true,
        deliveryContact: {
          usageTypes: ["delivery", "order_notifications"],
          firstName: "Demo",
          lastName: "Customer",
          email: DEMO_EMAIL,
          phone: "+966500000000",
        },
      },
    },
  );
  if (!res.ok()) {
    throw new Error(`checkout address seed HTTP ${res.status()}: ${await res.text()}`);
  }

  const summaryRes = await page.request.get(
    `${API_BASE}/checkout/${encodeURIComponent(session.cartId)}/summary`,
    { headers: { Authorization: `Bearer ${session.token}` } },
  );
  if (!summaryRes.ok()) {
    throw new Error(`checkout summary HTTP ${summaryRes.status()}: ${await summaryRes.text()}`);
  }
  const summaryBody = await summaryRes.json();
  const summary = summaryBody?.data ?? summaryBody;
  if (!summary?.addressComplete) {
    throw new Error("Checkout address seed did not mark address complete");
  }
}

/** Select first shipping option via API. */
export async function seedCheckoutShippingViaApi(page) {
  const session = await waitForStableCart(page);

  const optsRes = await page.request.get(
    `${API_BASE}/checkout/${encodeURIComponent(session.cartId)}/shipping-options`,
    { headers: { Authorization: `Bearer ${session.token}` } },
  );
  if (!optsRes.ok()) {
    throw new Error(`shipping options HTTP ${optsRes.status()}: ${await optsRes.text()}`);
  }
    const optsBody = await optsRes.json();
  const optsPayload = optsBody?.data ?? optsBody;
  const opts = Array.isArray(optsPayload)
    ? optsPayload
    : Array.isArray(optsPayload?.options)
      ? optsPayload.options
      : [];
  const first = opts[0] ?? null;
  if (!first?.id) {
    throw new Error("No shipping options available for checkout");
  }

  const shipRes = await page.request.put(
    `${API_BASE}/checkout/${encodeURIComponent(session.cartId)}/shipping`,
    {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { shippingOptionId: first.id },
    },
  );
  if (!shipRes.ok()) {
    throw new Error(`checkout shipping seed HTTP ${shipRes.status()}: ${await shipRes.text()}`);
  }
}
