import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface MessageTriggerData {
  messageId: number
  messageContent: string
  conversationId: number
  listingId: number
  listingTitle: string
  listingDescription: string
  senderUserId: number
  senderUserName: string
  receiverUserId: number
  receiverUserName: string
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

// POST - Yeni mesaj geldiğinde N8N'i tetikle
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

    const body: MessageTriggerData = await request.json()

    // Validasyon
    if (!body.messageId || !body.conversationId || !body.receiverUserId) {
      return NextResponse.json(
        { success: false, message: 'messageId, conversationId ve receiverUserId alanları zorunludur' },
        { status: 400 }
      )
    }

    // Bot kullanıcı ID'leri
    const BOT_USERS = {
      kiz: 1001,
      erkek: 1002,
      amca: 1003
    }

    const botUserIds = Object.values(BOT_USERS)

    // Eğer mesaj bot kullanıcılarından birine gelmişse N8N'i tetikle
    if (botUserIds.includes(body.receiverUserId)) {
      // Bot karakterini belirle
      let botCharacter: 'kiz' | 'erkek' | 'amca' = 'kiz'
      if (body.receiverUserId === BOT_USERS.erkek) botCharacter = 'erkek'
      else if (body.receiverUserId === BOT_USERS.amca) botCharacter = 'amca'

      // N8N webhook URL'ini çağır
      const n8nWebhookUrl = process.env.N8N_MESSAGE_WEBHOOK_URL
      
      if (n8nWebhookUrl) {
        try {
          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messageId: body.messageId,
              messageContent: body.messageContent,
              conversationId: body.conversationId,
              listingId: body.listingId,
              listingTitle: body.listingTitle,
              listingDescription: body.listingDescription,
              senderUserId: body.senderUserId,
              senderUserName: body.senderUserName,
              receiverUserId: body.receiverUserId,
              botCharacter: botCharacter,
              timestamp: new Date().toISOString()
            })
          })

          if (n8nResponse.ok) {
            return NextResponse.json({
              success: true,
              message: 'N8N webhook başarıyla tetiklendi',
              data: {
                botCharacter,
                n8nTriggered: true
              }
            }, {
              status: 200,
              headers: {
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
              }
            })
          } else {
            console.error('N8N webhook hatası:', await n8nResponse.text())
            return NextResponse.json({
              success: false,
              message: 'N8N webhook çağrısı başarısız',
              error: 'N8N response error'
            }, { status: 500 })
          }
        } catch (error) {
          console.error('N8N webhook çağrı hatası:', error)
          return NextResponse.json({
            success: false,
            message: 'N8N webhook çağrısında hata',
            error: error instanceof Error ? error.message : 'Bilinmeyen hata'
          }, { status: 500 })
        }
      } else {
        return NextResponse.json({
          success: false,
          message: 'N8N webhook URL tanımlanmamış',
          data: {
            botCharacter,
            n8nTriggered: false
          }
        }, { status: 200 })
      }
    } else {
      // Bot kullanıcısına gelen mesaj değil, işlem yapma
      return NextResponse.json({
        success: true,
        message: 'Bot kullanıcısına gelen mesaj değil, işlem yapılmadı',
        data: {
          n8nTriggered: false
        }
      }, { status: 200 })
    }

  } catch (error) {
    console.error('Message trigger hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Mesaj tetikleme işleminde hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// GET - Endpoint bilgilerini döndür
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhook/message-trigger',
    method: 'POST',
    description: 'Yeni mesaj geldiğinde N8N otomasyonunu tetikler',
    authentication: 'x-api-key header ile API key gönderilmeli',
    rateLimit: 'Saatte 100 istek limiti',
    
    purpose: 'Bot kullanıcılarına mesaj geldiğinde N8N webhook\'ini tetikler',
    
    requiredFields: [
      'messageId',
      'conversationId', 
      'receiverUserId'
    ],
    
    optionalFields: [
      'messageContent',
      'listingId',
      'listingTitle',
      'listingDescription',
      'senderUserId',
      'senderUserName'
    ],

    botUsers: {
      kiz: 1001,
      erkek: 1002,
      amca: 1003
    },

    environmentVariables: [
      'WEBHOOK_API_KEY',
      'N8N_MESSAGE_WEBHOOK_URL'
    ],

    headers: {
      'x-api-key': 'your_webhook_key',
      'Content-Type': 'application/json'
    },

    example: {
      messageId: 456,
      messageContent: 'Merhaba, ürününüz hala satılık mı?',
      conversationId: 123,
      listingId: 789,
      listingTitle: 'iPhone 14 Pro Max',
      listingDescription: 'Temiz kullanılmış iPhone...',
      senderUserId: 101,
      senderUserName: 'ahmet123',
      receiverUserId: 1001
    }
  })
}
