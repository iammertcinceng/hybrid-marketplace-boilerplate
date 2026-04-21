import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@shared/db'
import { blogs } from '@shared/schemas'

export const dynamic = 'force-dynamic'

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface BlogRequest {
  title: string
  slug?: string
  description?: string
  content: string
  metaTitle?: string
  metaDescription?: string
  schema?: string
}

// Slug oluşturma fonksiyonu
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
    .trim()
}

// Rate limiting kontrolü
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 saat
  const maxRequests = 50 // Saatte 50 istek (blog için daha düşük)
  
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
          message: 'Rate limit aşıldı. Saatte maksimum 50 istek yapabilirsiniz.',
          retryAfter: '1 hour'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        }
      )
    }

    const body: BlogRequest = await request.json()

    // Zorunlu alanları kontrol et
    const { title, content } = body
    if (!title || !content) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'title ve content alanları zorunludur' 
        },
        { status: 400 }
      )
    }

    // Validasyon kontrolleri
    if (title.length < 5 || title.length > 255) {
      return NextResponse.json(
        { success: false, message: 'Başlık 5-255 karakter arası olmalıdır' },
        { status: 400 }
      )
    }

    if (content.length < 50) {
      return NextResponse.json(
        { success: false, message: 'İçerik en az 50 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Slug oluştur veya kontrol et
    let finalSlug = body.slug || generateSlug(title)
    
    // Slug benzersizlik kontrolü
    let slugCounter = 1
    let originalSlug = finalSlug
    while (true) {
      const existingBlog = await db.query.blogs.findFirst({
        where: (blogs, { eq }) => eq(blogs.slug, finalSlug)
      })
      
      if (!existingBlog) break
      
      finalSlug = `${originalSlug}-${slugCounter}`
      slugCounter++
    }

    // Schema validasyonu (opsiyonel)
    if (body.schema) {
      try {
        JSON.parse(body.schema)
      } catch (error) {
        return NextResponse.json(
          { success: false, message: 'Schema geçerli bir JSON formatında olmalıdır' },
          { status: 400 }
        )
      }
    }

    // Blog oluştur
    const newBlog = await db.insert(blogs).values({
      title,
      slug: finalSlug,
      description: body.description,
      content,
      metaTitle: body.metaTitle || title,
      metaDescription: body.metaDescription || body.description,
      schema: body.schema ? JSON.parse(body.schema) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    return NextResponse.json({
      success: true,
      data: {
        blogId: newBlog[0].id,
        title: title,
        slug: finalSlug,
        description: body.description,
        content: content.substring(0, 100) + '...', // İçeriğin ilk 100 karakteri
        metaTitle: body.metaTitle || title,
        metaDescription: body.metaDescription || body.description,
        createdAt: newBlog[0].createdAt,
        source: 'n8n-webhook'
      },
      message: 'Blog başarıyla oluşturuldu ve yayınlandı'
    }, { 
      status: 201,
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Blog webhook hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Blog oluşturulurken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// GET method - Endpoint bilgilerini döndür
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhook/blog',
    method: 'POST',
    description: 'N8N webhook ile blog oluşturma (Header-based auth + Rate limiting)',
    authentication: 'x-api-key header ile API key gönderilmeli',
    rateLimit: 'Saatte 50 istek limiti',
    requiredFields: ['title', 'content'],
    optionalFields: ['slug', 'description', 'metaTitle', 'metaDescription', 'schema'],
    autoSlugGeneration: 'Slug verilmezse başlıktan otomatik oluşturulur',
    slugUniqueness: 'Aynı slug varsa otomatik olarak sayı eklenir',
    validation: {
      title: '5-255 karakter arası',
      content: 'Minimum 50 karakter',
      slug: 'URL-friendly format (opsiyonel, otomatik oluşur)',
      schema: 'Geçerli JSON formatı (opsiyonel)'
    },
    headers: {
      'x-api-key': 'your_webhook_key',
      'Content-Type': 'application/json'
    },
    example: {
      title: 'Next.js ile Modern Web Geliştirme',
      content: 'Next.js, React tabanlı modern web uygulamaları geliştirmek için güçlü bir framework\'tür. Bu yazıda Next.js\'in temel özelliklerini ve avantajlarını inceleyeceğiz...',
      description: 'Next.js framework\'ünün temel özelliklerini ve avantajlarını keşfedin',
      metaTitle: 'Next.js Rehberi - Modern Web Geliştirme',
      metaDescription: 'Next.js ile modern, hızlı ve SEO dostu web uygulamaları nasıl geliştirilir öğrenin',
      schema: '{"@context": "https://schema.org", "@type": "Article", "headline": "Next.js ile Modern Web Geliştirme"}'
    }
  })
}
