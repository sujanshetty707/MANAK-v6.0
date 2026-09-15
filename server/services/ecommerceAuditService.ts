import dotenv from 'dotenv';
import { ExtractionResult, Product } from '../../src/types';

dotenv.config();

export interface EcommerceAuditInput {
  url: string;
  platform?: string;
  performed_by?: any;
}

export interface ExtractedListingData {
  title: string;
  brand: string;
  generic_name: string;
  manufacturer: string;
  mrp: { amount: number; raw_text: string; is_inclusive_taxes: boolean };
  net_quantity: { amount: number; unit: string };
  mfg_date?: string;
  expiry_date?: string;
  country_of_origin: string;
  consumer_care?: { phone?: string; email?: string; address?: string };
  image_url?: string;
  raw_listing_text: string;
}

export function normalizeEcommerceUrl(rawUrl: string): { cleanUrl: string; platform: string; productId?: string } {
  let cleanUrl = rawUrl.trim();
  try {
    const parsed = new URL(cleanUrl);
    const trackingParams = ['tag', 'ref', 'ref_', 'pf_rd_r', 'pf_rd_p', 'pd_rd_r', 'pd_rd_w', 'pd_rd_wg', 'qid', 'sr', 'keywords', 'source', 'utm_source', 'utm_medium', 'utm_campaign'];
    trackingParams.forEach(p => parsed.searchParams.delete(p));
    cleanUrl = parsed.toString();
    const host = parsed.hostname.toLowerCase();
    let platform = 'other';
    let productId: string | undefined;
    if (host.includes('amazon')) {
      platform = 'amazon';
      const m = parsed.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
      if (m) productId = m[1];
    } else if (host.includes('flipkart')) {
      platform = 'flipkart';
      const pid = parsed.searchParams.get('pid') || parsed.pathname.match(/\/p\/([a-zA-Z0-9]+)/)?.[1];
      if (pid) productId = pid;
    } else if (host.includes('blinkit')) {
      platform = 'blinkit';
      const m = parsed.pathname.match(/\/prn\/[^/]+\/prid\/(\d+)/i);
      if (m) productId = m[1];
    } else if (host.includes('zepto')) {
      platform = 'zepto';
      const m = parsed.pathname.match(/\/pn\/[^/]+\/pvid\/([^/?#]+)/i);
      if (m) productId = m[1];
    }
    return { cleanUrl, platform, productId };
  } catch {
    return { cleanUrl, platform: 'other' };
  }
}

async function resolveRedirects(url: string): Promise<string> {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  try {
    // HEAD first — fast, no body
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': ua }, signal: AbortSignal.timeout(8000) });
    if (res.url && res.url !== url) { console.log(`[Fetcher] Redirect: ${url} → ${res.url}`); return res.url; }
    return url;
  } catch {
    try {
      // Fallback to GET if HEAD fails
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': ua }, signal: AbortSignal.timeout(8000) });
      if (res.url && res.url !== url) { console.log(`[Fetcher] GET-Redirect: ${url} → ${res.url}`); return res.url; }
    } catch { /* noop */ }
    return url;
  }
}

async function fetchListingContent(url: string): Promise<{
  title: string; metaDescription: string; ogImage?: string; jsonLd?: any;
  cleanedText: string; detectedImages: string[]; resolvedUrl: string;
}> {
  let resolvedUrl = url;
  try {
    resolvedUrl = await resolveRedirects(url);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      'Cache-Control': 'no-cache',
    };
    const res = await fetch(resolvedUrl, { headers, redirect: 'follow', signal: AbortSignal.timeout(12000) });
    if (res.status === 404) throw new Error(`Product not found on marketplace (HTTP 404). Check the product URL.`);
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
    if (title.toLowerCase().includes('page not found') || title === '404') {
      throw new Error('Marketplace: Page Not Found. The product may be unlisted or URL is invalid.');
    }
    if (title.toLowerCase().includes('sign-in') || title.toLowerCase().includes('robot check')) {
      console.warn('[Fetcher] Bot/sign-in challenge — content will be thin; Gemini search grounding will activate');
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : '';

    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    const ogImage = ogImgMatch ? ogImgMatch[1].trim() : undefined;

    const detectedImages: string[] = [];
    if (ogImage) detectedImages.push(ogImage);

    // Amazon high-res images from embedded JSON
    const hiResJson = html.match(/"hiRes":"(https:[^"]+\.jpg)"/g) || [];
    for (const m of hiResJson.slice(0, 4)) {
      const img = m.replace(/"hiRes":"/, '').replace(/"$/, '');
      if (!detectedImages.includes(img)) detectedImages.push(img);
    }
    // Amazon CDN fallback
    let m;
    const amazonRx = /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%_.-]+\.(?:jpg|jpeg|png)/gi;
    while ((m = amazonRx.exec(html)) && detectedImages.length < 6) {
      if (!detectedImages.includes(m[0])) detectedImages.push(m[0]);
    }
    // Flipkart CDN
    const flipkartRx = /https:\/\/rukminim\d*\.flixcart\.com\/image\/[^"'\s]+\.(?:jpg|jpeg|png)/gi;
    while ((m = flipkartRx.exec(html)) && detectedImages.length < 6) {
      if (!detectedImages.includes(m[0])) detectedImages.push(m[0]);
    }

    // JSON-LD — prefer schema.org/Product
    let jsonLd: any = null;
    const ldAll = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const ld of ldAll) {
      try {
        const p = JSON.parse(ld[1].trim());
        if (p['@type'] === 'Product' || p['@type'] === 'ItemPage') { jsonLd = p; break; }
        if (!jsonLd) jsonLd = p;
      } catch { /* ignore */ }
    }

    const bodyOnly = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ').trim();

    return { title, metaDescription, ogImage, jsonLd, cleanedText: bodyOnly.slice(0, 15000), detectedImages, resolvedUrl };

  } catch (err) {
    console.warn(`[Fetcher] Error for ${url}:`, (err as Error).message);
    return { title: '', metaDescription: '', cleanedText: '', detectedImages: [], resolvedUrl };
  }
}

async function extractDeclarationsWithGemini(
  originalUrl: string,
  resolvedUrl: string,
  platform: string,
  fetchedData: { title: string; metaDescription: string; ogImage?: string; jsonLd?: any; cleanedText: string; detectedImages: string[] }
): Promise<ExtractedListingData> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_VISION_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const hasText = fetchedData.cleanedText.trim().length > 200;
  const jsonLdStr = fetchedData.jsonLd ? JSON.stringify(fetchedData.jsonLd).slice(0, 3000) : 'None';
  const effectiveUrl = resolvedUrl || originalUrl;

  const { parseLabelText } = await import('../../src/services/labelParser.js');
  const textFallback = parseLabelText(`${fetchedData.title}\n${fetchedData.metaDescription}\n${fetchedData.cleanedText}`);

  // Download up to 3 detected packaging images for multi-modal Gemini Vision OCR
  const imageParts: any[] = [];
  for (const imgUrl of fetchedData.detectedImages.slice(0, 3)) {
    try {
      const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(6000) });
      if (imgRes.ok) {
        const buf = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buf).toString('base64');
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        imageParts.push({ inline_data: { mime_type: mimeType, data: base64 } });
      }
    } catch (e) {
      console.warn(`[GeminiVision] Image download skipped: ${imgUrl}`, (e as Error).message);
    }
  }
  console.log(`[EcommerceAudit] Prepared ${imageParts.length} packaging images for Multi-Modal Gemini Vision.`);

  const prompt = `You are a Legal Metrology Compliance Auditor for the Government of India under Packaged Commodities Rules 2011.

Product URL: ${effectiveUrl}
Platform: ${platform}
Page Title: ${fetchedData.title || 'not available'}
Meta Description: ${fetchedData.metaDescription || 'not available'}
JSON-LD Data: ${jsonLdStr}

Page Text Content & Specifications:
---
${hasText ? fetchedData.cleanedText : '(Page text limited — analyze attached packaging photos and URL/title)'}
---

${imageParts.length > 0 ? `Attached are ${imageParts.length} product packaging photos (front, back label, nutrition/specs table). Perform OCR on all packaging photos and read the page text to extract:` : 'Extract ALL mandatory Legal Metrology statutory declarations:'}
1. GENERIC NAME — common name of commodity (Rule 6(1)(b)), e.g. "Wheat Flour Atta", "Biscuits", "Hair Oil", "Tea"
2. BRAND NAME
3. MANUFACTURER/PACKER/IMPORTER — full company name + full address with city, state and postal PIN code (Rule 6(1)(a))
4. MRP — Maximum Retail Price in INR; note if "inclusive of all taxes" is declared (Rule 6(1)(e))
5. NET QUANTITY — numeric amount and standard unit: g, kg, ml, L, pcs, Count (Rule 6(1)(c))
6. MANUFACTURE DATE or EXPIRY / BEST BEFORE date (Rule 6(1)(d))
7. COUNTRY OF ORIGIN — required by law for all Indian e-commerce (Rule 6(10)). Look for "Country of Origin", "Made in", "Manufactured in"
8. CONSUMER CARE — helpline phone number, email address and physical address (Rule 6(2))

Return ONLY valid JSON matching exactly this schema:
{
  "title": "complete product title",
  "brand": "brand name",
  "generic_name": "generic commodity name",
  "manufacturer": "full manufacturer/packer name and postal address with PIN",
  "mrp": { "amount": 0, "raw_text": "", "is_inclusive_taxes": true },
  "net_quantity": { "amount": 0, "unit": "g" },
  "mfg_date": null,
  "expiry_date": null,
  "country_of_origin": "India",
  "consumer_care": { "phone": null, "email": null, "address": null },
  "image_url": "${fetchedData.ogImage || fetchedData.detectedImages[0] || ''}"
}

Rules:
- If a statutory declaration is visible on ANY attached packaging photo OR in the listing text/specifications table, extract it!
- Set missing string fields to null, missing numbers to 0.
- Do NOT invent addresses or PIN codes.
- mrp.amount must be a plain number, e.g. 299.
- net_quantity.amount must be a plain number, e.g. 500.
- country_of_origin is MANDATORY for Indian e-commerce — null only if completely absent.`;

  const models = ['models/gemini-2.0-flash', 'models/gemini-flash-lite-latest'];
  let rawResponseText = '';

  for (const model of models) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
    try {
      const body: any = {
        contents: [{ parts: [{ text: prompt }, ...imageParts] }],
        generationConfig: { temperature: 0.1 }
      };
      if (imageParts.length === 0 && !hasText) {
        body.tools = [{ google_search: {} }];
        console.log(`[Gemini] Enabling search grounding with ${model}`);
      }
      const res = await fetch(apiUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(30000)
      });
      if (res.ok) {
        const data = await res.json();
        rawResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (rawResponseText.trim()) { console.log(`[Gemini] Extracted successfully with ${model}`); break; }
      } else {
        const errText = await res.text();
        console.warn(`[Gemini] ${model} HTTP ${res.status}:`, errText.slice(0, 200));
      }
    } catch (err) {
      console.warn(`[Gemini] ${model} failed:`, (err as Error).message);
    }
  }

  let parsed: any = null;
  if (rawResponseText) {
    try {
      const cleaned = rawResponseText.replace(/^```json\s*/m, '').replace(/^```\s*/m, '').replace(/```\s*$/m, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Gemini] JSON parse failed:', (e as Error).message);
    }
  }

  const notNull = (v: any) => (v && v !== 'null' && v !== 'undefined') ? v : undefined;
  const bestImage = fetchedData.ogImage || fetchedData.detectedImages[0] || '';

  // Fallback regex for MRP if missing
  let mrpAmount = Number(parsed?.mrp?.amount) || textFallback.mrp.value?.amount || 0;
  let mrpRaw = notNull(parsed?.mrp?.raw_text) || (textFallback.mrp.value ? `MRP ₹${textFallback.mrp.value.amount}` : '');
  if (!mrpAmount) {
    const mrpMatch = fetchedData.cleanedText.match(/M\.?R\.?P\.?\s*:\s*₹?\s*(\d+(?:\.\d{1,2})?)/i) ||
                     fetchedData.cleanedText.match(/₹\s*(\d+(?:\.\d{1,2})?)/);
    if (mrpMatch) {
      mrpAmount = parseFloat(mrpMatch[1]);
      mrpRaw = `M.R.P.: ₹${mrpAmount}`;
    }
  }

  return {
    title: parsed?.title || fetchedData.title || textFallback.generic_name.value || 'E-Commerce Product Listing',
    brand: parsed?.brand || textFallback.manufacturer.value?.split(',')[0] || 'Marketplace Brand',
    generic_name: parsed?.generic_name || textFallback.generic_name.value || fetchedData.title || 'Packaged Commodity',
    manufacturer: parsed?.manufacturer || textFallback.manufacturer.value || '',
    mrp: {
      amount: mrpAmount,
      raw_text: mrpRaw,
      is_inclusive_taxes: parsed?.mrp?.is_inclusive_taxes !== false
    },
    net_quantity: {
      amount: Number(parsed?.net_quantity?.amount) || textFallback.net_quantity.value?.amount || 0,
      unit: notNull(parsed?.net_quantity?.unit) || textFallback.net_quantity.value?.unit || 'g'
    },
    mfg_date: notNull(parsed?.mfg_date) || textFallback.mfg_date.value || undefined,
    expiry_date: notNull(parsed?.expiry_date) || textFallback.expiry_date.value || undefined,
    country_of_origin: notNull(parsed?.country_of_origin) || textFallback.country_of_origin.value || 'India',
    consumer_care: {
      phone: notNull(parsed?.consumer_care?.phone) || textFallback.consumer_care.value?.phone,
      email: notNull(parsed?.consumer_care?.email) || textFallback.consumer_care.value?.email,
      address: notNull(parsed?.consumer_care?.address) || textFallback.consumer_care.value?.address,
    },
    image_url: bestImage,
    images: fetchedData.detectedImages,
    raw_listing_text: fetchedData.cleanedText
  };
}

export async function auditEcommerceUrl(input: EcommerceAuditInput): Promise<{ product: Product; extraction: ExtractionResult }> {
  let { cleanUrl, platform, productId } = normalizeEcommerceUrl(input.url);
  console.log(`[EcommerceAudit] Auditing: ${cleanUrl} (Platform: ${platform}, ID: ${productId || 'n/a'})`);

  const fetchedData = await fetchListingContent(cleanUrl);
  const resolvedUrl = fetchedData.resolvedUrl || cleanUrl;

  // Re-detect platform from the resolved URL (important for short-links like amzn.in)
  if (resolvedUrl && resolvedUrl !== cleanUrl) {
    const re = normalizeEcommerceUrl(resolvedUrl);
    if (re.platform !== 'other') { platform = re.platform; productId = re.productId; }
    console.log(`[EcommerceAudit] Resolved: ${resolvedUrl} → Platform: ${platform}, ID: ${productId || 'n/a'}`);
  }

  const extracted = await extractDeclarationsWithGemini(input.url, resolvedUrl, platform, fetchedData);

  const extraction: ExtractionResult = {
    manufacturer: { value: extracted.manufacturer || null, source: 'ocr', confidence: extracted.manufacturer ? 0.94 : 0 },
    generic_name: { value: extracted.generic_name || null, source: 'ocr', confidence: extracted.generic_name ? 0.95 : 0 },
    net_quantity: {
      value: extracted.net_quantity.amount > 0 ? { amount: extracted.net_quantity.amount, unit: extracted.net_quantity.unit } : null,
      source: 'ocr', confidence: extracted.net_quantity.amount > 0 ? 0.92 : 0
    },
    mrp: {
      value: extracted.mrp.amount > 0 ? { amount: extracted.mrp.amount, raw_text: extracted.mrp.raw_text, is_inclusive_taxes: extracted.mrp.is_inclusive_taxes } : null,
      source: 'ocr', confidence: extracted.mrp.amount > 0 ? 0.95 : 0
    },
    mfg_date: { value: extracted.mfg_date || null, source: 'ocr', confidence: extracted.mfg_date ? 0.90 : 0 },
    expiry_date: extracted.expiry_date ? { value: extracted.expiry_date, source: 'ocr', confidence: 0.90 } : undefined,
    consumer_care: {
      value: (extracted.consumer_care?.phone || extracted.consumer_care?.email || extracted.consumer_care?.address) ? {
        phone: extracted.consumer_care?.phone, email: extracted.consumer_care?.email, address: extracted.consumer_care?.address
      } : null,
      source: 'ocr', confidence: (extracted.consumer_care?.phone || extracted.consumer_care?.email) ? 0.90 : 0
    },
    country_of_origin: { value: extracted.country_of_origin || null, source: 'ocr', confidence: extracted.country_of_origin ? 0.95 : 0 },
    numeral_height_mm: { value: null, reference_detected: false, note: 'Digital e-commerce listing — font legibility via DOM render' },
    raw_ocr_text: extracted.raw_listing_text.slice(0, 6000)
  };

  const product: Product = {
    id: `prod-ecom-${Date.now().toString().slice(-6)}`,
    title: extracted.title,
    brand: extracted.brand || 'Online Marketplace Brand',
    category: 'E-Commerce Commodity',
    source_type: 'ecommerce',
    ecommerce_platform: (['amazon', 'flipkart', 'blinkit', 'zepto'].includes(platform) ? platform : 'other') as any,
    ecommerce_url: resolvedUrl || cleanUrl,
    image_url: extracted.image_url || undefined,
    images: extracted.images && extracted.images.length > 0 ? extracted.images : (extracted.image_url ? [extracted.image_url] : undefined)
  };

  return { product, extraction };
}
