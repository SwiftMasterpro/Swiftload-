# Google Forms Integration Setup Guide

## Overview

SwiftLoad uses a **hybrid approach**:

1. **Native forms** at `/forms/*` — Beautiful SwiftLoad-branded forms that submit directly to Supabase
2. **Google Forms** — Standard Google Forms that forward responses to SwiftLoad via webhook
3. **Both sync** to the same Supabase tables — all submissions in one place for the admin dashboard

---

## Four Google Forms to Create

| Form | URL Slug | Purpose |
|------|----------|---------|
| Load Quote Request | `load-quote` | Clients requesting freight quotes |
| Driver Registration | `driver-register` | Drivers applying to join |
| Business Onboarding | `business-onboard` | Business accounts |
| General Enquiry | `general-enquiry` | Support / contact |

---

## Step 1 — Create the Google Forms

Go to [forms.google.com](https://forms.google.com) and create each form.

### Form 1: Load Quote Request
**Questions** (exact names matter for field mapping):
- Full name *(Short answer)*
- Email address *(Short answer)*
- Phone number *(Short answer)*
- Company name *(Short answer)*
- Pickup city *(Dropdown — use BW_CITIES)*
- Dropoff city *(Dropdown — use BW_CITIES)*
- Cargo type *(Dropdown — use CARGO_TYPES)*
- Weight (tons) *(Short answer)*
- Vehicle type *(Dropdown — use VEHICLE_TYPES)*
- Preferred pickup date *(Date)*
- Maximum budget (BWP) *(Short answer)*
- Flexible dates? *(Multiple choice: Yes / No)*
- Special instructions *(Paragraph)*

### Form 2: Driver Registration
**Questions:**
- Full name
- Email address
- Phone number
- Home city *(Dropdown)*
- Omang / National ID
- Licence class *(Multiple choice: B / C / C1 / D / EB)*
- Licence expiry date *(Date)*
- Vehicle make
- Vehicle model
- Vehicle year *(Short answer)*
- Registration number
- Vehicle type *(Dropdown)*
- Capacity (tons) *(Short answer)*
- Years of experience *(Short answer)*
- Has insurance? *(Multiple choice: Yes / No)*
- Insurance expiry *(Date)*
- Preferred routes *(Checkboxes)*

### Form 3: Business Onboarding
**Questions:**
- Company name
- Contact name
- Email address
- Phone number
- CIPA registration number
- Industry *(Dropdown)*
- Monthly load volume *(Multiple choice)*
- Fleet size *(Multiple choice)*
- Primary routes *(Checkboxes)*
- Additional notes *(Paragraph)*

### Form 4: General Enquiry
**Questions:**
- Full name
- Email address
- Phone number
- Category *(Multiple choice: General / Support / Partnership / Press / Careers / Other)*
- Subject *(Short answer)*
- Message *(Paragraph)*

---

## Step 2 — Link Google Forms to SwiftLoad via Apps Script

For **each** Google Form:

1. Open the form in edit mode
2. Click **⋮ More** → **Script editor** (or Extensions → Apps Script)
3. Replace all code with the following:

```javascript
// SwiftLoad Google Forms → Supabase Webhook
// Copy this script into each Google Form's Apps Script editor

const WEBHOOK_URL    = 'https://swiftload.co.bw/api/forms/webhook';
const WEBHOOK_SECRET = 'YOUR_SECRET_HERE'; // Set in Vercel as GOOGLE_FORMS_WEBHOOK_SECRET
const FORM_KEY       = 'load-quote'; // Change per form: load-quote | driver-register | business-onboard | general-enquiry

function onFormSubmit(e) {
  const response   = e.response;
  const responseId = response.getId();
  const timestamp  = response.getTimestamp().toISOString();
  const email      = response.getRespondentEmail() || '';

  // Build answers object from item responses
  const answers = {};
  response.getItemResponses().forEach(function(itemResponse) {
    const question = itemResponse.getItem().getTitle();
    const answer   = itemResponse.getResponse();
    // Handle checkbox (array) answers
    answers[question] = Array.isArray(answer) ? answer.join(', ') : String(answer);
  });

  // Create HMAC signature
  const payloadToSign = FORM_KEY + ':' + responseId + ':' + timestamp;
  const hmac = computeHmacSha256(payloadToSign, WEBHOOK_SECRET);

  const payload = JSON.stringify({
    form_key:          FORM_KEY,
    response_id:       responseId,
    timestamp:         timestamp,
    respondent_email:  email,
    answers:           answers,
    hmac:              hmac
  });

  const options = {
    method:             'post',
    contentType:        'application/json',
    payload:            payload,
    muteHttpExceptions: true
  };

  try {
    const response_http = UrlFetchApp.fetch(WEBHOOK_URL, options);
    const code          = response_http.getResponseCode();
    Logger.log('SwiftLoad webhook response: ' + code + ' — ' + response_http.getContentText());
  } catch (err) {
    Logger.log('SwiftLoad webhook error: ' + err.toString());
  }
}

function computeHmacSha256(message, secret) {
  const secretBytes  = Utilities.newBlob(secret).getBytes();
  const messageBytes = Utilities.newBlob(message).getBytes();
  const signature    = Utilities.computeHmacSha256Signature(messageBytes, secretBytes);
  return signature.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

// Run this once manually to install the trigger
function installTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
  Logger.log('Trigger installed for: ' + form.getTitle());
}
```

4. Change `FORM_KEY` to match the form (e.g. `'driver-register'`)
5. Change `WEBHOOK_SECRET` to your secret (same as `GOOGLE_FORMS_WEBHOOK_SECRET` in Vercel)
6. Click **Run** → **installTrigger** (once, to register the trigger)
7. Approve permissions when prompted

---

## Step 3 — Set Environment Variable

In Vercel Dashboard → Project → Settings → Environment Variables:

```
GOOGLE_FORMS_WEBHOOK_SECRET=your-strong-random-secret-here
```

Generate a secret:
```bash
openssl rand -hex 32
```

---

## Step 4 — Get Your Google Form URLs

After creating each form, get the shareable link and update these in the form pages:

| File | Variable | Update To |
|------|----------|-----------|
| `src/app/forms/load-quote/page.tsx` | `url=` in `<GoogleFormButton>` | Your Load Quote Form URL |
| `src/app/forms/driver-register/page.tsx` | `url=` in `<GoogleFormButton>` | Your Driver Reg Form URL |
| `src/app/forms/business-onboard/page.tsx` | `url=` in `<GoogleFormButton>` | Your Business Form URL |
| `src/app/forms/general-enquiry/page.tsx` | `url=` in `<GoogleFormButton>` | Your Enquiry Form URL |

And store in `google_form_configs` table:
```sql
UPDATE google_form_configs
SET 
  google_form_id = '1FAIpQL...',      -- from form URL
  prefill_url = 'https://docs.google.com/forms/d/.../viewform'
WHERE form_key = 'load-quote';
```

---

## Step 5 — Test the Integration

1. Submit a test response in your Google Form
2. Check Apps Script logs: View → Logs
3. Check Supabase: `form_submissions` table
4. Or call the API directly:
```bash
curl -X GET "https://swiftload.co.bw/api/forms/submit?form_key=load-quote" \
  -H "Cookie: your-admin-session"
```

---

## Admin Dashboard

All submissions are visible in the Admin Dashboard at `/dashboard/admin` under the **Forms** tab.

Admins can:
- View all submissions by form type
- Filter by status (new / reviewing / actioned / spam)
- Add notes and mark as actioned
- Convert load-quote submissions into real loads
- Convert driver applications into driver profiles

---

## Webhook Endpoint Reference

```
POST https://swiftload.co.bw/api/forms/webhook
GET  https://swiftload.co.bw/api/forms/webhook?challenge=xxx  (verification)
```

**Payload:**
```json
{
  "form_key": "load-quote",
  "response_id": "unique-google-id",
  "timestamp": "2025-01-15T10:00:00Z",
  "respondent_email": "user@example.com",
  "answers": {
    "Full name": "Thabo Molefe",
    "Email address": "thabo@example.com",
    "Pickup city": "Gaborone",
    "Dropoff city": "Francistown",
    "Cargo type": "Building Materials",
    "Weight (tons)": "8"
  },
  "hmac": "sha256-hex-signature"
}
```

**Response:**
```json
{ "success": true, "submission_id": "uuid" }
```
