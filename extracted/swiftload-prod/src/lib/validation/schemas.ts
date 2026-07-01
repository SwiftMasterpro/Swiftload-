import { z } from 'zod'
export const loadSchema = z.object({
  title: z.string().min(5,'Min 5 chars').max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1,'Select a category'),
  cargo_type: z.string().min(1,'Select cargo type'),
  weight_tons: z.number().min(0.1).max(60),
  volume_m3: z.number().min(0.1).optional(),
  pickup_address: z.string().min(5),
  pickup_city: z.string().min(2),
  dropoff_address: z.string().min(5),
  dropoff_city: z.string().min(2),
  vehicle_type: z.string().min(1),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  pickup_date: z.string().min(1),
  pickup_time: z.string().optional(),
  flexible_dates: z.boolean().default(false),
})
export const bidSchema = z.object({
  load_id: z.string().uuid(),
  amount: z.number().min(100,'Minimum bid P 100'),
  message: z.string().max(300).optional(),
  estimated_pickup: z.string().optional(),
  estimated_delivery: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
})
export const roadReportSchema = z.object({
  type: z.enum(['checkpoint','roadblock','accident','traffic','breakdown','flood','construction','weighbridge','fuel_shortage','dangerous_road','unsafe_area','road_closure']),
  title: z.string().min(5).max(100),
  description: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  route: z.string().optional(),
  severity: z.number().int().min(1).max(5),
  anonymous: z.boolean().default(false),
})
export const registerSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  role: z.enum(['customer','driver','business','fleet_owner']),
  company_name: z.string().optional(),
})
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoadInput = z.infer<typeof loadSchema>
export type BidInput = z.infer<typeof bidSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
