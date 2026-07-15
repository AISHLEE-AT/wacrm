import { describe, expect, it, vi, beforeEach } from 'vitest'
import { handleRideHailingBooking } from './rides-handler'
import * as googleMaps from '../google-maps'
import * as metaApi from './meta-api'
import { createClient } from '@supabase/supabase-js'

// Mock dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}))

vi.mock('../google-maps', () => ({
  getRideEstimate: vi.fn(),
  calculatePrice: vi.fn(),
  reverseGeocode: vi.fn()
}))

vi.mock('./meta-api', () => ({
  sendTextMessage: vi.fn(),
  sendInteractiveButtons: vi.fn()
}))

vi.mock('./hardcoded-config', () => ({
  HARDCODED_WHATSAPP_CONFIG: {
    phone_number_id: 'test_phone_id',
    access_token: 'test_token',
    verify_token: 'test_verify_token',
    account_id: 'test_account_id',
    user_id: 'test_user_id'
  }
}))

describe.skip('rides-handler', () => {
  let mockSupabase: any
  let mockSelect: any
  let mockInsert: any
  let mockUpdate: any
  let mockEq: any
  let mockOrder: any
  let mockLimit: any
  let mockMaybeSingle: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Supabase fluent API mock chain
    mockMaybeSingle = vi.fn().mockResolvedValue({ data: null })
    mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
    mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
    mockEq = vi.fn().mockReturnValue({ 
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ order: mockOrder })
      })
    })
    
    mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })

    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate
      })
    }

    ;(createClient as any).mockReturnValue(mockSupabase)
    
    // Default Google Maps mocks
    ;(googleMaps.reverseGeocode as any).mockResolvedValue('123 Test St')
    ;(googleMaps.getRideEstimate as any).mockResolvedValue({
      distanceText: '5 km',
      distanceMeters: 5000,
      durationText: '10 mins',
      durationSeconds: 600
    })
    ;(googleMaps.calculatePrice as any).mockReturnValue(125)
  })

  it('initiates booking flow when user texts "ride"', async () => {
    const message = { text: { body: 'ride' } }
    
    const result = await handleRideHailingBooking(
      message, 'account_1', 'contact_1', '+1234567890', 'token'
    )

    expect(result).toBe(true)
    expect(metaApi.sendTextMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          type: 'text',
          text: { body: expect.stringContaining('PICKUP location') }
        })
      })
    )
  })

  it('initiates scheduled booking when user texts "schedule a ride"', async () => {
    const message = { text: { body: 'schedule a ride for tomorrow 9am' } }
    
    const result = await handleRideHailingBooking(
      message, 'account_1', 'contact_1', '+1234567890', 'token'
    )

    expect(result).toBe(true)
    expect(metaApi.sendTextMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          text: { body: expect.stringContaining('tomorrow 9am') }
        })
      })
    )
  })

  it('handles pickup location pin and prompts for dropoff', async () => {
    const message = { 
      type: 'location', 
      location: { latitude: 12.9716, longitude: 77.5946 } 
    }
    
    // No active ride
    mockMaybeSingle.mockResolvedValueOnce({ data: null })

    const result = await handleRideHailingBooking(
      message, 'account_1', 'contact_1', '+1234567890', 'token'
    )

    expect(result).toBe(true)
    expect(googleMaps.reverseGeocode).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('rides')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        pickup_lat: 12.9716,
        pickup_lng: 77.5946,
        status: 'pending'
      })
    )
    expect(metaApi.sendTextMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          type: 'text',
          text: { body: expect.stringContaining('DROPOFF location') }
        })
      })
    )
  })

  it('handles dropoff location pin and sends quotation', async () => {
    const message = { 
      type: 'location', 
      location: { latitude: 12.9352, longitude: 77.6245 } 
    }
    
    // Active ride with pickup but no dropoff
    mockMaybeSingle.mockResolvedValueOnce({ 
      data: { 
        id: 'ride_123',
        pickup_lat: 12.9716, 
        pickup_lng: 77.5946,
        pickup_address: 'Start Address',
        distance_km: null 
      } 
    })

    const result = await handleRideHailingBooking(
      message, 'account_1', 'contact_1', '+1234567890', 'token'
    )

    expect(result).toBe(true)
    expect(googleMaps.getRideEstimate).toHaveBeenCalled()
    expect(googleMaps.calculatePrice).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        dropoff_lat: 12.9352,
        dropoff_lng: 77.6245,
        estimated_price: 125
      })
    )
    expect(metaApi.sendTextMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          type: 'interactive',
          interactive: expect.objectContaining({
            type: 'button',
            body: { text: expect.stringContaining('Estimated Fare: ₹125') }
          })
        })
      })
    )
  })

  it('confirms the ride on interactive button reply', async () => {
    const message = { 
      type: 'interactive', 
      interactive: { button_reply: { id: 'confirm_ride_ride_123' } } 
    }

    const result = await handleRideHailingBooking(
      message, 'account_1', 'contact_1', '+1234567890', 'token'
    )

    expect(result).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'pending' }) // Ready for dispatch
    expect(metaApi.sendTextMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          type: 'interactive',
          interactive: expect.objectContaining({
            type: 'button',
            body: { text: expect.stringContaining('confirmed') }
          })
        })
      })
    )
  })

  it('handles anti-haggling reports', async () => {
    const message = { 
      type: 'interactive', 
      interactive: { button_reply: { id: 'report_ride_ride_123' } } 
    }

    const result = await handleRideHailingBooking(
      message, 'account_1', 'contact_1', '+1234567890', 'token'
    )

    expect(result).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ is_flagged: true, flag_reason: 'Driver demanding extra fare' })
    )
    expect(metaApi.sendTextMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          text: { body: expect.stringContaining('Thank you for reporting') }
        })
      })
    )
  })
})
