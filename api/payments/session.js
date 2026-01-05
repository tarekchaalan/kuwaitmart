import { supabaseAdmin } from "../_utils/supabaseAdmin.js";
import {
  insertPaymentIfSupported,
  addPaymentEventIfSupported,
} from "../_utils/payments.js";
import { roundKWD } from "../_utils/money.js";

const CLICK_BASE_URL = process.env.CLICK_BASE_URL || "https://clickkw.com";
const CLICK_DEVELOPER_USER = process.env.CLICK_DEVELOPER_USER;
const CLICK_KEY = process.env.CLICK_KEY;
const BASE_URL = process.env.BASE_URL;
const MIN_ORDER_KWD = Number(process.env.MIN_ORDER_KWD || 0);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    console.log("[payment/session] Start - Environment check:", {
      hasClickUser: !!CLICK_DEVELOPER_USER,
      hasClickKey: !!CLICK_KEY,
      hasBaseUrl: !!BASE_URL,
      baseUrl: BASE_URL,
    });
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const { orderId } = body;
    if (!orderId) return res.status(400).json({ error: "orderId required" });
    if (!CLICK_DEVELOPER_USER || !CLICK_KEY)
      return res.status(500).json({ error: "Gateway env missing" });
    if (!BASE_URL) return res.status(500).json({ error: "BASE_URL missing" });

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (oErr) throw oErr;
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (String(order.status) === "paid")
      return res.status(400).json({ error: "Order already paid" });
    if (order.mf_session_id) {
      return res.json({
        sessionId: String(order.mf_session_id),
        indicator: String(order.payment_ref || ""),
      });
    }
    if (!Number(order.total_kwd) || Number(order.total_kwd) <= 0)
      return res.status(400).json({ error: "Invalid amount" });
    if (MIN_ORDER_KWD > 0 && Number(order.total_kwd) < MIN_ORDER_KWD) {
      return res
        .status(400)
        .json({ error: "amount_below_minimum", min: MIN_ORDER_KWD });
    }

    const url = `${CLICK_BASE_URL}/api/developer/gatedeveloper/${encodeURIComponent(
      CLICK_DEVELOPER_USER
    )}`;
    // Generate a unique order_id for Click gateway (timestamp-based to ensure uniqueness across retries)
    // Click requires order_id to be unique across ALL transactions, even retries
    const uniqueOrderId = Date.now();
    console.log(
      "[payment/session] Generated unique order_id for Click:",
      uniqueOrderId,
      "Database order_number:",
      order.order_number
    );
    const requestBody = {
      order_id: uniqueOrderId,
      order_amount: roundKWD(order.total_kwd),
      customer_name: order.name || order.full_name || "",
      customer_phone: order.phone || "",
      customer_email: order.email || "",
      customer_address: order.address || "",
      customer_comment: order.notes || "",
      customer_civilid: "",
      lang: "en",
      return_url: `${BASE_URL.replace(
        /\/$/,
        ""
      )}/checkout/return?orderId=${encodeURIComponent(order.id)}`,
    };
    console.log("[payment/session] Calling Click API:", { url, requestBody });
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLICK_KEY}`,
      },
      body: JSON.stringify(requestBody),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    console.log("[payment/session] Click API response:", {
      status: r.status,
      ok: r.ok,
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return res.status(502).json({
        error: "click_create_session_failed",
        status: r.status,
        body: txt,
      });
    }
    const payload = await r.json().catch(() => ({}));
    const ses = payload?.gatewayResponse || {};
    if (!ses.session_id || !ses.indicator_status) {
      return res
        .status(400)
        .json({ error: "Failed to create session", details: payload });
    }

    // Store both the session_id and the Click order_id we used
    await supabaseAdmin
      .from("orders")
      .update({
        mf_session_id: String(ses.session_id),
        payment_ref: String(ses.indicator_status),
        order_number: uniqueOrderId, // Store the Click order_id for reuse
      })
      .eq("id", orderId);

    // Soft-create a payments row and event (if payments table exists)
    const ins = await insertPaymentIfSupported({
      orderId,
      amountKwd: order.total_kwd,
      currency: order.currency || "KWD",
      sessionId: String(ses.session_id),
      indicatorToken: String(ses.indicator_status),
      status: "initiated",
      method: "CARD",
      gatewayRaw: payload || null,
    });
    if (ins?.id) {
      await addPaymentEventIfSupported({
        paymentId: ins.id,
        event: "session_created",
        payload: payload || null,
      });
    } else if (ins?.error) {
      try {
        console.warn(
          "payments.insert failed",
          String(ins.error?.message || ins.error)
        );
      } catch {}
    }

    return res.json({
      sessionId: String(ses.session_id),
      indicator: String(ses.indicator_status),
    });
  } catch (e) {
    console.error("/api/payments/session error:", e);
    console.error("Error details:", { message: e?.message, stack: e?.stack });
    const dev = process.env.NODE_ENV !== "production";
    return res.status(500).json(
      dev
        ? {
            error: "internal_error",
            message: String(e?.message || e),
            stack: e?.stack,
          }
        : { error: "internal_error" }
    );
  }
}
