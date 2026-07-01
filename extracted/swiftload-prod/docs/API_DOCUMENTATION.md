# SwiftLoad — API Documentation

Base URL: `https://swiftload.co.bw/api`

All endpoints return JSON. Authenticated endpoints require `Authorization: Bearer <supabase_jwt>`.

---

## Loads

### `GET /loads`
Browse available loads.

**Query params:**
| Param        | Type   | Description                    |
|-------------|--------|-------------------------------|
| page        | number | Page number (default: 1)      |
| per_page    | number | Results per page (max: 50)    |
| vehicle_type| string | Filter by vehicle type        |
| max_weight  | number | Max weight in kg              |

**Response:**
```json
{ "data": [...], "count": 120, "page": 1, "per_page": 20, "total_pages": 6 }
```

### `POST /loads`
Create a new load. **Auth required.**

**Body:**
```json
{
  "title": "Steel pipes — Gaborone to Francistown",
  "cargo_type": "general",
  "weight_kg": 2500,
  "pickup_address": "Gaborone Industrial, Plot 12345",
  "pickup_coords": { "lat": -24.6282, "lng": 25.9231 },
  "delivery_address": "Francistown Depot",
  "delivery_coords": { "lat": -21.1667, "lng": 27.5167 },
  "pickup_date": "2025-07-15T08:00:00Z",
  "budget_min": 1500,
  "budget_max": 2500
}
```

---

## Bids

### `GET /bids?load_id=<uuid>`
Get all bids on a specific load.

### `POST /bids`
Place a bid on a load. **Auth required (driver role).**

```json
{
  "load_id": "uuid",
  "driver_id": "uuid",
  "amount": 1800,
  "message": "Can pick up same day",
  "estimated_arrival": "2025-07-15T09:30:00Z"
}
```

---

## Road Reports

### `GET /road-reports?lat=-24.6&lng=25.9&radius=50`
Get active road reports within radius (km).

### `POST /road-reports`
Submit a road report.

```json
{
  "type": "police_checkpoint",
  "lat": -24.12,
  "lng": 26.45,
  "notes": "3 officers, checking permits",
  "severity": 2,
  "is_anonymous": false
}
```

**Types:** `police_checkpoint` | `roadblock` | `accident` | `traffic` | `breakdown` | `flood` | `construction` | `weighbridge` | `fuel_shortage` | `dangerous_road` | `unsafe_area` | `road_closure`

---

## Tracking

### `POST /tracking`
Submit a GPS tracking update. **Auth required (driver role).**

```json
{
  "booking_id": "uuid",
  "lat": -23.1,
  "lng": 26.8,
  "speed_kmh": 95,
  "heading": 45
}
```

---

## Escrow

### `POST /escrow`
Create an escrow payment intent.

```json
{
  "booking_id": "uuid",
  "amount": 1800,
  "currency": "bwp"
}
```

**Response:** `{ "data": {...}, "client_secret": "pi_xxx_secret_yyy" }`

---

## AI Assistant

### `POST /ai`
Query the SwiftAI logistics assistant.

```json
{
  "message": "How much to ship 5 tons Gaborone to Maun?",
  "context": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

**Response:** `{ "reply": "Based on the route distance of ~697km and a 5-ton load..." }`

---

## Webhooks

### `POST /webhooks/stripe`
Stripe webhook endpoint. Verify with `STRIPE_WEBHOOK_SECRET`.

**Events handled:**
- `payment_intent.succeeded` — marks escrow as held
- `payment_intent.payment_failed` — resets escrow to pending
- `transfer.created` — releases escrow, marks booking confirmed
