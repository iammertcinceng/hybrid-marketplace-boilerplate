import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@shared/db'
import { listings, users, categories } from '@shared/schemas'
import { eq } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface ListingRequest {
  userId: number
  title: string
  description: string
  city: string
  categoryId: number
  contactPerson?: string
  phone?: string
  listingType?: 'standard' | 'premium'
  images?: string[]
  views?: number
}

// Şehir listesini yükle
function loadCityList() {
  try {
    const cityListPath = path.join(process.cwd(), 'public', 'city-list.json')
    const cityData = JSON.parse(fs.readFileSync(cityListPath, 'utf8'))
    return cityData.cities
  } catch (error) {
    console.error('Şehir listesi yüklenemedi:', error)
    return []
  }
}

// Şehir adını normalize et ve kontrol et
function validateCity(cityInput: string) {
  const cities = loadCityList()
  const normalizedInput = cityInput.toLowerCase().trim()
  
  // Önce value ile eşleşme ara
  let city = cities.find((c: any) => c.value === normalizedInput)
  
  // Bulunamazsa label ile ara (case insensitive)
  if (!city) {
    city = cities.find((c: any) => 
      c.label.toLowerCase() === normalizedInput ||
      c.label.toLowerCase().includes(normalizedInput)
    )
  }
  
  return city ? city.value : null
}

// Rate limiting kontrolü
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 saat
  const maxRequests = 100 // Saatte 100 istek
  
  const current = rateLimitMap.get(identifier)
  
  if (!current || now > current.resetTime) {
    // Yeni window başlat
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  return { allowed: true, remaining: maxRequests - current.count }
}

export async function POST(request: NextRequest) {
  try {
    // API Key kontrolü (Header'dan al)
    const apiKey = request.headers.get('x-api-key')
    if (!process.env.WEBHOOK_API_KEY || apiKey !== process.env.WEBHOOK_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz API anahtarı' },
        { status: 401 }
      )
    }

    // Rate limiting kontrolü
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const rateLimitResult = checkRateLimit(clientIP)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Rate limit aşıldı. Saatte maksimum 100 istek yapabilirsiniz.',
          retryAfter: '1 hour'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        }
      )
    }

    const body: ListingRequest = await request.json()

    // Zorunlu alanları kontrol et
    const { userId, title, description, city, categoryId, views } = body
    if (!userId || !title || !description || !city || !categoryId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'userId, title, description, city ve categoryId alanları zorunludur' 
        },
        { status: 400 }
      )
    }

    // Validasyon kontrolleri
    if (title.length < 10 || title.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Başlık 10-100 karakter arası olmalıdır' },
        { status: 400 }
      )
    }

    if (description.length < 30) {
      return NextResponse.json(
        { success: false, message: 'Açıklama en az 30 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Views validasyonu - opsiyonel ama pozitif sayı olmalı
    if (views !== undefined && (typeof views !== 'number' || views < 0)) {
      return NextResponse.json(
        { success: false, message: 'Views değeri pozitif bir sayı olmalıdır' },
        { status: 400 }
      )
    }

    // Telefon formatı kontrolü (opsiyonel)
    if (body.phone && !/^05\d{9}$/.test(body.phone)) {
      return NextResponse.json(
        { success: false, message: 'Telefon numarası geçersiz format (05xxxxxxxxx)' },
        { status: 400 }
      )
    }

    // Şehir validasyonu ve normalize etme
    const validatedCity = validateCity(city)
    if (!validatedCity) {
      return NextResponse.json(
        { success: false, message: `Geçersiz şehir: ${city}. Lütfen geçerli bir Türkiye şehri girin.` },
        { status: 400 }
      )
    }

    // Kullanıcı varlığını kontrol et (auth bypass - sadece varlık kontrolü)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Kategori ID kontrolü (sadece varlık kontrolü)
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId)
    })

    if (!category) {
      return NextResponse.json(
        { success: false, message: `Kategori bulunamadı: ${categoryId}` },
        { status: 404 }
      )
    }

    // İlan oluştur
    const newListing = await db.insert(listings).values({
      title,
      description,
      city: validatedCity,
      categoryId,
      contactPerson: body.contactPerson,
      phone: body.phone,
      listingType: body.listingType || 'standard',
      approved: true, // Webhook ilanları otomatik onaylanır
      active: true,
      views: views || 0, // Başlangıç görüntülenme sayısı (varsayılan 0)
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
      userId,
      user_ip: '0.0.0.0', // Webhook için placeholder
      paymentStatus: null,
      createdAt: new Date(),
      updated_at: new Date()
    }).returning()

    return NextResponse.json({
      success: true,
      data: {
        listingId: newListing[0].id,
        title: title,
        description: description,
        category: category.name,
        categoryId: categoryId,
        city: validatedCity,
        userId: userId,
        userName: user.username || user.email,
        approved: true,
        active: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        source: 'n8n-webhook'
      },
      message: 'İlan başarıyla oluşturuldu ve yayınlandı'
    }, { 
      status: 201,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Listing webhook hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'İlan oluşturulurken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// GET method - Endpoint bilgilerini döndür
export async function GET() {
  const cities = loadCityList()
  const sampleCities = cities.slice(0, 5).map((c: any) => c.label)
  
  return NextResponse.json({
    endpoint: '/api/webhook/listing',
    method: 'POST',
    description: 'N8N webhook ile ilan oluşturma (Header-based auth + Rate limiting)',
    authentication: 'x-api-key header ile API key gönderilmeli',
    rateLimit: 'Saatte 100 istek limiti',
    requiredFields: ['userId', 'title', 'description', 'city', 'categoryId'],
    optionalFields: ['contactPerson', 'phone', 'listingType', 'images', 'views'],
    autoApproval: 'Tüm webhook ilanları otomatik onaylanır ve yayınlanır',
    cityValidation: 'Şehir adı text olarak kabul edilir ve otomatik normalize edilir',
    categoryValidation: 'Kategori ID kontrolü yapılır',
    validation: {
      title: '10-100 karakter arası',
      description: 'Minimum 30 karakter',
      phone: '05xxxxxxxxx formatında (opsiyonel)',
      city: `Text olarak (örn: ${sampleCities.join(', ')})`,
      categoryId: 'Geçerli kategori ID numarası',
      views: 'Pozitif sayı (opsiyonel, varsayılan: 0)'
    },
    headers: {
      'x-api-key': 'your_webhook_key',
      'Content-Type': 'application/json'
    },
    example: {
      userId: 123,
      title: 'Satılık 2015 Honda Civic',
      description: 'Temiz kullanılmış, bakımlı araç. Tüm bakımları zamanında yapılmış.',
      city: 'İstanbul',
      categoryId: 5,
      contactPerson: 'Satış Temsilcisi',
      phone: '05551234567',
      listingType: 'premium',
      views: 72
    }
  })
}
