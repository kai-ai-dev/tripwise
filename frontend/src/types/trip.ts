export type TripStatus = 'pending' | 'generating' | 'success' | 'failed'
export type Pace = 'budget' | 'standard' | 'deep'

export interface PlanRequest {
  origin: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  preferences: string[]
  pace: Pace
}

export interface ItineraryItem {
  id: string
  start_time: string
  end_time: string
  place_name: string
  category: string
  notes?: string
  estimated_cost: number
}

export interface ItineraryDay {
  id: string
  day_index: number
  date: string
  title: string
  summary: string
  day_budget: number
  items: ItineraryItem[]
}

export interface TripPlan {
  id: string
  origin: string
  destination: string
  start_date: string
  end_date: string
  budget: number
  pace: Pace
  status: TripStatus
  days: ItineraryDay[]
  created_at: string
}

export interface StatusResponse {
  id: string
  status: TripStatus
  progress_hint?: string
  latency_ms?: number
  error_message?: string
}
