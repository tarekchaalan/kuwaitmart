import { supabaseAdmin } from "../_utils/supabaseAdmin.js";
import {
  updatePaymentBySessionOrOrder,
  addPaymentEventIfSupported,
} from "../_utils/payments.js";
import { roundKWD } from "../_utils/money.js";

const CLICK_BASE_URL = process.env.CLICK_BASE_URL || "https://clickkw.com";
const CLICK_DEVELOPER_USER = process.env.CLICK_DEVELOPER_USER;
const CLICK_KEY = process.env.CLICK_KEY;
const BASE_URL = process.env.BASE_URL;
const MIN_ORDER_KWD = Number(process.env.MIN_ORDER_KWD || 0);

export default async function handler(req, res) {
  const isGet = req.method === "GET";
  if (!isGet && req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    console.log("[payment/session-update] Start - Method:", req.method);
    const bodyIn = isGet
      ? req.query || {}
      : typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};
    const { orderId, lang = "en", sessionId: sessionIdFromBody } = bodyIn;
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
    const sessionId = String(sessionIdFromBody || order.mf_session_id || "");
    if (!sessionId)
      return res.status(400).json({ error: "No session for order" });
    if (MIN_ORDER_KWD > 0 && Number(order.total_kwd) < MIN_ORDER_KWD) {
      return res
        .status(400)
        .json({ error: "amount_below_minimum", min: MIN_ORDER_KWD });
    }

    // IMPORTANT: Reuse the same order_id that was used in session creation
    // The order_number field stores the Click order_id from session creation
    // If missing, generate a new one (shouldn't happen in normal flow)
    // Ensure it stays within INT range for Click API
    let uniqueOrderId = order.order_number;
    if (!uniqueOrderId) {
      const timestampPart = Date.now() % 1000000000;
      uniqueOrderId = timestampPart + (Number(order.id) || 0);
    }
    console.log(
      "[payment/session-update] Using order_id for Click:",
      uniqueOrderId,
      "From DB order_number:",
      order.order_number
    );
    const body = {
      session_id: sessionId,
      order_id: uniqueOrderId,
      order_amount: roundKWD(order.total_kwd),
      return_url: `${BASE_URL.replace(
        /\/$/,
        ""
      )}/checkout/return?orderId=${encodeURIComponent(
        order.id
      )}&lang=${encodeURIComponent(lang === "ar" ? "ar" : "en")}`,
      customer_name: order.name || order.full_name || "",
      customer_phone: order.phone || "",
      customer_email: order.email || "",
      customer_address: order.address || "",
      customer_comment: order.notes || "",
      customer_civilid: "",
      lang: lang === "ar" ? "ar" : "en",
    };
    console.log("[payment/session-update] Request body:", body);

    // test mode removed; always call gateway

    // Some installations 404 the lang-in-path form. Try with and without {lang}.
    const urls = [
      `${CLICK_BASE_URL}/api/developer/gatedeveloper/sessionupdate/${encodeURIComponent(
        CLICK_DEVELOPER_USER
      )}/${body.lang}`,
      `${CLICK_BASE_URL}/api/developer/gatedeveloper/sessionupdate/${encodeURIComponent(
        CLICK_DEVELOPER_USER
      )}`,
    ];

    let payload = null;
    let lastError = null;
    for (const u of urls) {
      try {
        console.log("[payment/session-update] Calling Click API:", u);
        const r = await fetch(u, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CLICK_KEY}`,
          },
          body: JSON.stringify(body),
          redirect: "manual",
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        console.log(
          "[payment/session-update] Click API responded:",
          u,
          "Status:",
          r.status
        );
        // If the gateway responds with a redirect, capture Location without following
        const loc =
          r.headers.get("location") || r.headers.get("Location") || null;
        if (loc && r.status >= 300 && r.status < 400) {
          await supabaseAdmin
            .from("orders")
            .update({ gateway_raw: { location: loc, status: r.status } })
            .eq("id", orderId);
          await updatePaymentBySessionOrOrder({
            sessionId,
            orderId,
            patch: {
              status: "redirected",
              gateway_raw: { location: loc, status: r.status },
            },
            event: "redirected",
            eventPayload: { location: loc, status: r.status },
          });
          if (isGet) {
            res.statusCode = 303;
            res.setHeader("Location", loc);
            return res.end();
          }
          return res.json({
            paymentUrl: loc,
            redirectUrl: loc,
            payload: { location: loc, status: r.status },
          });
        }
        if (r.ok) {
          const loc =
            r.headers.get("location") || r.headers.get("Location") || null;
          console.log(
            "[payment/session-update] Success response from:",
            u,
            "Location header:",
            loc
          );
          // Some gateways respond with 200 + empty body but include a Location header
          if (loc) {
            await supabaseAdmin
              .from("orders")
              .update({ gateway_raw: { location: loc } })
              .eq("id", orderId);
            await updatePaymentBySessionOrOrder({
              sessionId,
              orderId,
              patch: { status: "redirected", gateway_raw: { location: loc } },
              event: "redirected",
              eventPayload: { location: loc },
            });
            return res.json({
              paymentUrl: loc,
              redirectUrl: loc,
              payload: { location: loc },
            });
          }
          payload = await r.json().catch(() => ({}));
          console.log(
            "[payment/session-update] Gateway response payload:",
            JSON.stringify(payload)
          );

          // Check if Click returned an error (status: 0 or negative indicates error)
          if (payload.status !== undefined && payload.status <= 0) {
            console.error(
              "[payment/session-update] Click gateway error:",
              payload.message || payload
            );
            lastError = {
              url: u,
              status: r.status,
              body: JSON.stringify(payload),
              clickError: payload.message,
            };
            continue; // Try next URL
          }

          await updatePaymentBySessionOrOrder({
            sessionId,
            orderId,
            patch: { status: "redirected", gateway_raw: payload },
            event: "session_updated",
            eventPayload: payload,
          });
          break;
        }
        const txt = await r.text().catch(() => "");
        console.log(
          "[payment/session-update] Click API error response:",
          u,
          "Status:",
          r.status,
          "Body:",
          txt
        );
        lastError = { url: u, status: r.status, body: txt };
      } catch (fetchError) {
        console.error(
          "[payment/session-update] Fetch error for:",
          u,
          fetchError
        );
        lastError = {
          url: u,
          error: fetchError.message || String(fetchError),
          type: fetchError.name,
        };
      }
    }
    if (!payload) {
      if (isGet) return res.status(502).send("click_update_session_failed");
      return res
        .status(502)
        .json({ error: "click_update_session_failed", tried: lastError });
    }

    await supabaseAdmin
      .from("orders")
      .update({ gateway_raw: payload })
      .eq("id", orderId);

    // Try multiple possible field names for payment URL
    const paymentUrl =
      payload?.gatewayResponse?.payment_url ||
      payload?.gatewayResponse?.paymentUrl ||
      payload?.gatewayResponse?.redirect_url ||
      payload?.gatewayResponse?.redirectUrl ||
      payload?.gatewayResponse?.url ||
      payload?.payment_url ||
      payload?.paymentUrl ||
      payload?.redirect_url ||
      payload?.redirectUrl ||
      payload?.url ||
      null;
    console.log(
      "[payment/session-update] Payment URL from gateway:",
      paymentUrl
    );
    console.log(
      "[payment/session-update] Full gateway payload:",
      JSON.stringify(payload, null, 2)
    );
    console.log(
      "[payment/session-update] Gateway response keys:",
      Object.keys(payload || {}),
      "gatewayResponse keys:",
      Object.keys(payload?.gatewayResponse || {})
    );

    // Build a redirectUrl from env template when paymentUrl is missing
    let redirectUrl = null;
    // Common Click gateway URL patterns - try multiple possibilities
    const tpl =
      process.env.CLICK_PAYMENT_URL_TEMPLATE ||
      `${CLICK_BASE_URL}/payment/{session_id}`;
    if (!paymentUrl && tpl) {
      try {
        redirectUrl = tpl
          .replaceAll("{session_id}", sessionId)
          .replaceAll("{developer_user}", String(CLICK_DEVELOPER_USER || ""));
        console.log(
          "[payment/session-update] Built redirect from template:",
          redirectUrl
        );
      } catch {}
    }

    // If template also fails, try common Click patterns
    if (!paymentUrl && !redirectUrl) {
      const commonPatterns = [
        `${CLICK_BASE_URL}/payment/${sessionId}`,
        `${CLICK_BASE_URL}/checkout/${sessionId}`,
        `${CLICK_BASE_URL}/gateway/payment/${sessionId}`,
      ];
      console.log(
        "[payment/session-update] Trying common patterns:",
        commonPatterns
      );
      // Use first pattern as fallback
      redirectUrl = commonPatterns[0];
    }

    // Static store pay page fallback (prefill via query). Set CLICK_STATIC_PAY_URL
    let staticPrefillUrl = null;
    if (!paymentUrl && !redirectUrl && process.env.CLICK_STATIC_PAY_URL) {
      const base = process.env.CLICK_STATIC_PAY_URL.replace(/\/$/, "");
      const qs = new URLSearchParams({
        full_name: order.name || "",
        name: order.name || "",
        customer_name: order.name || "",
        phone: order.phone || "",
        customer_phone: order.phone || "",
        email: order.email || "",
        customer_email: order.email || "",
        address: order.address || "",
        customer_address: order.address || "",
        amount: String(roundKWD(order.total_kwd)),
        order_amount: String(roundKWD(order.total_kwd)),
        lang: body.lang,
        order_id: String(uniqueOrderId),
      }).toString();
      staticPrefillUrl = `${base}?${qs}`;
    }

    if (isGet) {
      const to = paymentUrl || redirectUrl || staticPrefillUrl || null;
      console.log("[payment/session-update] Final redirect URL:", to);
      if (!to) {
        console.error(
          "[payment/session-update] No redirect URL found! Payload:",
          JSON.stringify(payload)
        );
        return res.status(502).send("missing_redirect");
      }
      res.statusCode = 303;
      res.setHeader("Location", to);
      return res.end();
    }
    if (paymentUrl)
      return res.json({ paymentUrl, redirectUrl: paymentUrl, payload });
    return res.json({
      ok: true,
      redirectUrl: redirectUrl || staticPrefillUrl,
      payload,
    });
  } catch (e) {
    console.error("/api/payments/session-update error", e);
    return res.status(500).json({ error: "internal_error" });
  }
}
