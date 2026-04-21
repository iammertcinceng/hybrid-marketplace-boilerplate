import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@shared/db'
import { messages, conversations, listings, users } from '@shared/schemas'
import { eq, and, desc, count } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// Bot kullanıcı ID'leri - Dinamik olarak değiştirilebilir
const BOT_USERS = {
  kiz: 1001,    // Kız bot user ID
  erkek: 1002,  // Erkek bot user ID  
  amca: 1003    // Amca bot user ID
}

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface IncomingMessageData {
  messageContent: string
  listingId: number
  listingTitle: string
  listingDescription: string
  senderUserId: number
  senderUserName: string
  conversationId: number
}

interface OutgoingMessageData {
  conversationId: number
  responseText: string
  botCharacter: 'kiz' | 'erkek' | 'amca'
}

// Rate limiting kontrolü
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 saat
  const maxRequests = 50 // Saatte 50 istek
  
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

// GET - Yeni mesajları N8N'e gönder (webhook trigger için)
export async function GET(request: NextRequest) {
  // Eğer API key yoksa, endpoint bilgilerini döndür (web test için)
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey) {
    return NextResponse.json({
      endpoint: '/api/webhook/auto-message',
      methods: ['GET', 'POST'],
      description: 'N8N otomatik mesaj cevaplama sistemi',
      authentication: 'x-api-key header ile API key gönderilmeli',
      rateLimit: 'Saatte 50 istek limiti',
      
      botUsers: BOT_USERS,
      
      get: {
        purpose: 'Bot kullanıcılarına gelen yeni mesajları N8N\'e gönder',
        parameters: 'Parametre gerektirmez',
        response: 'Bot kullanıcılarına gelen son mesajlar ve ilan bilgileri'
      },
      
      post: {
        purpose: 'N8N\'den gelen bot cevaplarını sisteme kaydet',
        bodyFormat: {
          conversationId: 'number (zorunlu)',
          responseText: 'string (zorunlu)',
          botCharacter: '"kiz", "erkek" veya "amca" (zorunlu)'
        },
        response: 'Gönderilen mesaj bilgileri'
      },

      headers: {
        'x-api-key': 'your_webhook_key',
        'Content-Type': 'application/json'
      },

      examples: {
        getRequest: 'GET /api/webhook/auto-message (with x-api-key header)',
        postRequest: {
          conversationId: 123,
          responseText: 'Merhaba! İlanınız çok güzel görünüyor.',
          botCharacter: 'kiz'
        }
      }
    })
  }

  try {
    // API Key kontrolü
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

    // Bot kullanıcılarına gelen son mesajları getir
    const botUserIds = Object.values(BOT_USERS)
    
    // Bot kullanıcılarına gelen mesajları getir
    
    // Bu gereksiz query'yi kaldır - zaten aşağıda her bot için ayrı ayrı yapıyoruz

    // Her bot kullanıcısı için ayrı ayrı kontrol et
    const allNewMessages = []
    
    for (const botUserId of botUserIds) {
      const botMessages = await db
        .select({
          messageId: messages.id,
          messageContent: messages.content,
          conversationId: messages.conversationId,
          senderUserId: messages.senderId,
          receiverUserId: messages.receiverId,
          createdAt: messages.createdAt,
          // Conversation bilgileri
          listingId: conversations.listingId,
          // Listing bilgileri
          listingTitle: listings.title,
          listingDescription: listings.description,
          // Sender bilgileri
          senderUserName: users.username,
          senderEmail: users.email
        })
        .from(messages)
        .leftJoin(conversations, eq(messages.conversationId, conversations.id))
        .leftJoin(listings, eq(conversations.listingId, listings.id))
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.receiverId, botUserId))
        .orderBy(desc(messages.createdAt))
        .limit(20)

      // Bot'lardan gelen mesajları filtrele
      const filteredMessages = botMessages.filter(msg => 
        !botUserIds.includes(msg.senderUserId)
      )

      allNewMessages.push(...filteredMessages)
    }

    // Duplicate'leri kaldır ve sırala
    const uniqueMessages = allNewMessages
      .filter((msg, index, self) => 
        index === self.findIndex(m => m.messageId === msg.messageId)
      )
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 50)

    // Her konuşma için mesaj sayısını kontrol et (3 mesaj limiti)
    const messagesWithCounts = []
    
    for (const msg of uniqueMessages) {
      // Bu konuşmada bot'un kaç mesaj gönderdiğini say
      const botMessageCount = await db
        .select({ count: count() })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, msg.conversationId),
            eq(messages.senderId, msg.receiverUserId || 0) // Bot'un gönderdiği mesajlar
          )
        )

      const currentBotMessages = botMessageCount[0]?.count || 0

      // Eğer bot henüz 3 mesaj göndermemişse, listeye ekle
      if (currentBotMessages < 3) {
        // Bot karakterini belirle
        let botCharacter: 'kiz' | 'erkek' | 'amca' = 'kiz'
        if (msg.receiverUserId === BOT_USERS.erkek) botCharacter = 'erkek'
        else if (msg.receiverUserId === BOT_USERS.amca) botCharacter = 'amca'

        messagesWithCounts.push({
          ...msg,
          botCharacter,
          currentBotMessages
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messagesWithCounts,
        total: messagesWithCounts.length,
        botUsers: BOT_USERS
      },
      message: `${messagesWithCounts.length} yeni mesaj bulundu`,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Auto-message GET hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Mesajlar getirilirken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// POST - N8N'den gelen bot cevaplarını kaydet
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

    const body: OutgoingMessageData = await request.json()

    // Validasyon
    if (!body.conversationId || !body.responseText || !body.botCharacter) {
      return NextResponse.json(
        { success: false, message: 'conversationId, responseText ve botCharacter alanları zorunludur' },
        { status: 400 }
      )
    }

    if (!['kiz', 'erkek', 'amca'].includes(body.botCharacter)) {
      return NextResponse.json(
        { success: false, message: 'botCharacter değeri kiz, erkek veya amca olmalıdır' },
        { status: 400 }
      )
    }

    // Bot user ID'sini al
    const botUserId = BOT_USERS[body.botCharacter]

    // Konuşmayı kontrol et
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, body.conversationId),
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Konuşma bulunamadı' },
        { status: 404 }
      )
    }

    // Bot'un bu konuşmada kaç mesaj gönderdiğini kontrol et
    const botMessageCount = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, body.conversationId),
          eq(messages.senderId, botUserId)
        )
      )

    const currentBotMessages = botMessageCount[0]?.count || 0

    if (currentBotMessages >= 3) {
      return NextResponse.json(
        { success: false, message: 'Bu bot bu konuşmada maksimum 3 mesaj göndermiş' },
        { status: 400 }
      )
    }

    // Receiver ID'sini belirle (bot değil olan kişi)
    const receiverId = conversation.senderId === botUserId 
      ? conversation.receiverId 
      : conversation.senderId

    // Mesajı kaydet
    const newMessage = await db
      .insert(messages)
      .values({
        conversationId: body.conversationId,
        senderId: botUserId,
        receiverId: receiverId,
        content: body.responseText,
        isRead: false,
        createdAt: new Date(),
        sender_ip: '0.0.0.0' // Bot mesajı
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: {
        message: newMessage[0],
        botCharacter: body.botCharacter,
        botUserId: botUserId,
        messagesRemaining: 3 - (currentBotMessages + 1)
      },
      message: 'Bot mesajı başarıyla gönderildi'
    }, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Auto-message POST hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Bot mesajı gönderilirken hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// OPTIONS - CORS için
export async function OPTIONS() {
  return NextResponse.json({
    endpoint: '/api/webhook/auto-message',
    methods: ['GET', 'POST'],
    description: 'N8N otomatik mesaj cevaplama sistemi',
    authentication: 'x-api-key header ile API key gönderilmeli',
    rateLimit: 'Saatte 50 istek limiti',
    
    botUsers: BOT_USERS,
    
    get: {
      purpose: 'Bot kullanıcılarına gelen yeni mesajları N8N\'e gönder',
      parameters: 'Parametre gerektirmez',
      response: 'Bot kullanıcılarına gelen son mesajlar ve ilan bilgileri'
    },
    
    post: {
      purpose: 'N8N\'den gelen bot cevaplarını sisteme kaydet',
      bodyFormat: {
        conversationId: 'number (zorunlu)',
        responseText: 'string (zorunlu)',
        botCharacter: '"kiz", "erkek" veya "amca" (zorunlu)'
      },
      response: 'Gönderilen mesaj bilgileri'
    },

    headers: {
      'x-api-key': 'your_webhook_key',
      'Content-Type': 'application/json'
    },

    examples: {
      getRequest: 'GET /api/webhook/auto-message (with x-api-key header)',
      postRequest: {
        conversationId: 123,
        responseText: 'Merhaba! İlanınız çok güzel görünüyor.',
        botCharacter: 'kiz'
      }
    }
  })
}
