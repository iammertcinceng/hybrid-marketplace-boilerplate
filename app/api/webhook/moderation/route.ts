import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@shared/db'
import { listings, users, categories } from '@shared/schemas'
import { eq, and, isNull, or } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface ModerationDecision {
  listingId: number
  decision: 'approved' | 'rejected'
  reason?: string
}

interface ModerationBatchRequest {
  decisions: ModerationDecision[]
}

// Rate limiting kontrolü
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 saat
  const maxRequests = 200 // Saatte 200 istek (moderation için yüksek)
  
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

// GET - Onay bekleyen ilanları getir (N8N cron job için)
export async function GET(request: NextRequest) {
  try {
    // API Key kontrolü
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
          message: 'Rate limit aşıldı. Saatte maksimum 200 istek yapabilirsiniz.',
          retryAfter: '1 hour'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '200',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        }
      )
    }

    // Sabit limit - maksimum 100 ilan
    const limit = 100

    // Onay bekleyen ilanları getir
    // approved = false 
    const pendingListings = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        city: listings.city,
        contactPerson: listings.contactPerson,
        phone: listings.phone,
        images: listings.images,
        listingType: listings.listingType,
        userId: listings.userId,
        categoryId: listings.categoryId,
        views: listings.views,
        createdAt: listings.createdAt,
        user_ip: listings.user_ip,
        // User bilgileri
        userName: users.username,
        userEmail: users.email,
        // Kategori bilgileri
        categoryName: categories.name
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .where(
        and(
          eq(listings.approved, false),
          eq(listings.active, true)
        )
      )
      .orderBy(listings.createdAt)
      .limit(limit)

    // İlanları işlenme durumuna güncelle (sadece updated_at güncelle)
    if (pendingListings.length > 0) {
      const listingIds = pendingListings.map(l => l.id)
      await db
        .update(listings)
        .set({
          updated_at: new Date()
        })
        .where(
          and(
            eq(listings.approved, false),
            or(...listingIds.map(id => eq(listings.id, id)))
          )
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        listings: pendingListings,
        total: pendingListings.length,
        limit
      },
      message: `${pendingListings.length} onay bekleyen ilan bulundu`,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-RateLimit-Limit': '200',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    })
  } catch (error) {
    console.error('Moderation GET hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Onay bekleyen ilanlar getirilirken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// POST - N8N'den gelen onay kararlarını işle
export async function POST(request: NextRequest) {
  try {
    // API Key kontrolü
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
          message: 'Rate limit aşıldı. Saatte maksimum 200 istek yapabilirsiniz.',
          retryAfter: '1 hour'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '200',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        }
      )
    }

    const body: ModerationBatchRequest = await request.json()

    // Validasyon
    if (!body.decisions || !Array.isArray(body.decisions) || body.decisions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'decisions array zorunludur ve boş olamaz' },
        { status: 400 }
      )
    }

    if (body.decisions.length > 50) {
      return NextResponse.json(
        { success: false, message: 'Tek seferde maksimum 50 karar işlenebilir' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    // Her kararı işle
    for (const decision of body.decisions) {
      try {
        const { listingId, decision: moderationDecision, reason } = decision

        // Validasyon
        if (!listingId || !moderationDecision) {
          errors.push({
            listingId,
            error: 'listingId ve decision alanları zorunludur'
          })
          continue
        }

        if (!['approved', 'rejected'].includes(moderationDecision)) {
          errors.push({
            listingId,
            error: 'decision değeri approved veya rejected olmalıdır'
          })
          continue
        }

        // İlanı güncelle (sadece mevcut alanları kullan)
        const updateResult = await db
          .update(listings)
          .set({
            approved: moderationDecision === 'approved',
            active: moderationDecision === 'approved', // Reddedilirse pasif yap
            updated_at: new Date()
          })
          .where(eq(listings.id, listingId))
          .returning()

        if (updateResult.length === 0) {
          errors.push({
            listingId,
            error: 'İlan bulunamadı veya güncellenemedi'
          })
          continue
        }

        results.push({
          listingId,
          decision: moderationDecision,
          reason,
          status: 'success',
          title: updateResult[0].title
        })

      } catch (error) {
        errors.push({
          listingId: decision.listingId,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        errors: errors.length,
        results,
      },
      message: `${results.length} ilan işlendi, ${errors.length} hata oluştu`
    }, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': '200',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Moderation POST hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Moderation kararları işlenirken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// OPTIONS - CORS için
export async function OPTIONS() {
  return NextResponse.json({
    endpoint: '/api/webhook/moderation',
    methods: ['GET', 'POST'],
    description: 'N8N moderation sistemi - İlan onay süreçlerini yönetir',
    authentication: 'x-api-key header ile API key gönderilmeli',
    rateLimit: 'Saatte 200 istek limiti',
    
    get: {
      purpose: 'Onay bekleyen ilanları getir (N8N cron job için)',
      parameters: 'Parametre gerektirmez - sabit 100 ilan limiti',
      response: 'Onay bekleyen ilanların listesi ve kullanıcı/category bilgileri'
    },
    
    post: {
      purpose: 'N8N\'den gelen onay kararlarını işle',
      bodyFormat: {
        decisions: [
          {
            listingId: 'number (zorunlu)',
            decision: '"approved" veya "rejected" (zorunlu)',
            reason: 'string (opsiyonel - red nedeni)'
          }
        ]
      },
      maxBatchSize: 50,
      response: 'İşlenen kararların sonuçları ve hatalar'
    },

    headers: {
      'x-api-key': 'your_webhook_key',
      'Content-Type': 'application/json'
    },

    examples: {
      getRequest: 'GET /api/webhook/moderation',
      postRequest: {
        decisions: [
          {
            listingId: 123,
            decision: 'approved'
          },
          {
            listingId: 124,
            decision: 'rejected',
            reason: 'Uygunsuz içerik tespit edildi'
          }
        ]
      }
    }
  })
}
