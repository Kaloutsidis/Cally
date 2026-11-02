/* Public, verified future-price copy only. This cannot buy anything or grant Premium. */
(() => {
  'use strict';
  const endpoint = 'https://ijzbofmhoznczznshgzj.supabase.co/functions/v1/app-store/campaign';
  const end = Date.parse('2026-11-30T22:00:00Z');
  const products = {
    'com.kaloutsidis.cally.pro.monthly': { plan: 'monthly', current: 2.99, regular: 8.99, period: 'month' },
    'com.kaloutsidis.cally.pro.yearly': { plan: 'yearly', current: 19.99, regular: 59.99, period: 'year' },
    'com.kaloutsidis.cally.pro.lifetime': { plan: 'lifetime', current: 49.99, regular: 200, period: null }
  };
  const euro = price => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(price);
  const header = document.querySelector('[data-offer-caption]');
  const subscriber = document.querySelector('[data-subscriber-offer-terms]');
  let generation = 0;
  let controller;
  let refreshTimer;
  let expiryTimer;

  function clearComparisons() {
    if (header) { header.hidden = true; header.textContent = ''; }
    if (subscriber) { subscriber.hidden = true; subscriber.textContent = ''; }
    document.querySelectorAll('[data-offer-comparison], [data-offer-lifetime-caption]').forEach(node => {
      node.hidden = true;
      node.textContent = '';
    });
  }

  function expire() {
    clearComparisons();
    // The endpoint stops confirming this campaign at its end. It does not confirm new current
    // prices afterward, so do not automatically advertise an unverified future price as current.
    document.querySelectorAll('[data-offer-plan]').forEach(element => {
      const amount = element.querySelector('[data-current-price]');
      if (!amount) return;
      if (element.tagName === 'SPAN') {
        const title = { monthly: 'Monthly', yearly: 'Yearly', lifetime: 'Lifetime' }[element.dataset.offerPlan];
        element.textContent = `${title} (see the current price in Cally)`;
      } else if (element.tagName === 'P') {
        element.textContent = 'Lifetime is a one-time purchase. See its current price in Cally; buying it does not automatically cancel an existing subscription.';
      } else {
        const line = amount.closest('.plan-price');
        if (line) { line.className = 'premium-terms'; line.textContent = 'See the current price in Cally.'; }
      }
    });
  }

  function verifiedPlans(config) {
    if (!config || config.schemaVersion !== 1 || config.campaignId !== 'autumn-2026' ||
        config.name !== 'Autumn offer' || config.currency !== 'EUR' || config.storefront !== 'GRC' ||
        config.endsAt !== '2026-11-30T22:00:00Z' || config.regularPricesEffectiveDate !== '2026-12-01' ||
        config.enabled !== true || !Array.isArray(config.verifiedProducts) ||
        config.verifiedProducts.length < 1 || config.verifiedProducts.length > 3 || Date.now() >= end) return [];
    const seen = new Set();
    const verified = [];
    for (const item of config.verifiedProducts) {
      if (!item || seen.has(item.productId) || !Object.hasOwn(products, item.productId)) return [];
      seen.add(item.productId);
      const pinned = products[item.productId];
      if (item.regularPrice !== pinned.regular) return [];
      verified.push(pinned);
    }
    return verified;
  }

  function lifetimeCaption(element) {
    let caption = element.parentElement.querySelector('[data-offer-lifetime-caption]');
    if (caption) return caption;
    caption = document.createElement(element.tagName === 'SPAN' ? 'span' : 'p');
    caption.className = 'offer-caption';
    caption.dataset.offerLifetimeCaption = '';
    caption.hidden = true;
    if (element.tagName === 'SPAN') element.prepend(caption, document.createElement('br'));
    else element.parentElement.insertBefore(caption, element);
    return caption;
  }

  function render(config) {
    clearComparisons();
    const matched = new Map();
    for (const plan of verifiedPlans(config)) {
      const element = document.querySelector(`[data-offer-plan="${plan.plan}"]`);
      const amount = element?.querySelector('[data-current-price]');
      // These pages explicitly quote Greece/EUR. Never compare a changed displayed price.
      if (!amount || amount.textContent.trim() !== euro(plan.current)) continue;
      matched.set(plan.plan, { plan, element });
    }
    const primaryVerified = matched.has('monthly') && matched.has('yearly');
    if (header && primaryVerified) {
      header.hidden = false;
      header.textContent = 'Autumn offer · Offer ends 30 November 2026';
    }
    for (const { plan, element } of matched.values()) {
      let comparison = element.querySelector('[data-offer-comparison]');
      if (!comparison) {
        comparison = document.createElement('span');
        comparison.className = 'offer-comparison';
        comparison.dataset.offerComparison = '';
        element.append(document.createElement('br'), comparison);
      }
      comparison.hidden = false;
      comparison.textContent = `Regular price from 1 December: ${euro(plan.regular)}${plan.period ? ` / ${plan.period}` : ' once'} · −${Math.round((1 - plan.current / plan.regular) * 100)}%`;
      if (plan.plan === 'lifetime' && !primaryVerified) {
        const caption = lifetimeCaption(element);
        caption.hidden = false;
        caption.textContent = 'Autumn offer · Offer ends 30 November 2026';
      }
    }
    if (subscriber && primaryVerified) {
      subscriber.hidden = false;
      subscriber.textContent = 'Subscriptions started at the Autumn offer price keep that renewal price unless cancelled. Lifetime does not renew; buying it does not cancel an existing subscription.';
    }
  }

  async function refresh() {
    clearTimeout(refreshTimer);
    if (document.hidden) return;
    if (Date.now() >= end) { expire(); return; }
    const requestGeneration = ++generation;
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;
    const timeout = setTimeout(() => requestController.abort(), 8000);
    try {
      const response = await fetch(endpoint, {
        method: 'GET', mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer',
        redirect: 'error', cache: 'no-store', headers: { Accept: 'application/json' }, signal: requestController.signal
      });
      if (response.status !== 200 || response.url !== endpoint ||
          response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new Error('Unavailable');
      const text = await response.text();
      if (new TextEncoder().encode(text).length > 16384) throw new Error('Oversized');
      const config = JSON.parse(text);
      if (generation !== requestGeneration || requestController.signal.aborted || document.hidden) return;
      if (Date.now() >= end) expire(); else render(config);
    } catch {
      if (generation === requestGeneration) clearComparisons();
    } finally {
      clearTimeout(timeout);
      if (generation === requestGeneration && !document.hidden && Date.now() < end) {
        refreshTimer = setTimeout(refresh, 60000);
      }
    }
  }

  function pause() {
    ++generation;
    controller?.abort();
    clearTimeout(refreshTimer);
    clearTimeout(expiryTimer);
    clearComparisons();
  }
  function resume() {
    refresh();
    clearTimeout(expiryTimer);
    const remaining = end - Date.now();
    // Browsers cap a single timer near 24.8 days; this short campaign is within that bound.
    if (remaining > 0 && remaining < 2147483647) expiryTimer = setTimeout(expire, remaining);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else resume(); });
  window.addEventListener('pagehide', pause);
  resume();
})();
