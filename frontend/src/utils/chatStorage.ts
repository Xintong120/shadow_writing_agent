import type { Message } from '@/types'

class ChatStorageManager {
  private db: IDBDatabase | null = null
  private readonly dbName = 'ShadowWritingChat'
  private readonly dbVersion = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error('IndexedDB error:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        console.log('Creating IndexedDB schema...')

        // 创建messages对象存储
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' })

        // 创建索引
        messageStore.createIndex('userId', 'userId', { unique: false })
        messageStore.createIndex('timestamp', 'timestamp', { unique: false })
        messageStore.createIndex('userId_timestamp', ['userId', 'timestamp'], { unique: false })

        console.log('IndexedDB schema created')
      }
    })
  }

  async saveMessage(message: Message): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      const request = store.add(message)

      request.onsuccess = () => {
        console.log('Message saved to IndexedDB:', message.id)
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to save message:', request.error)
        reject(request.error)
      }
    })
  }

  async getRecentMessages(userId: string, limit = 50): Promise<Message[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['messages'], 'readonly')
      const store = transaction.objectStore('messages')
      const index = store.index('userId_timestamp')
      const range = IDBKeyRange.bound([userId, 0], [userId, Date.now()])

      const request = index.openCursor(range, 'next') // 升序：从旧到新

      const messages: Message[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result

        if (cursor && messages.length < limit) {
          messages.push(cursor.value)
          cursor.continue()
        } else {
          console.log(`Loaded ${messages.length} messages from IndexedDB for user ${userId}`)
          resolve(messages)
        }
      }

      request.onerror = () => {
        console.error('Failed to get messages:', request.error)
        reject(request.error)
      }
    })
  }

  async getMessageCount(userId: string): Promise<number> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['messages'], 'readonly')
      const store = transaction.objectStore('messages')
      const index = store.index('userId')
      const request = index.count(userId)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        console.error('Failed to count messages:', request.error)
        reject(request.error)
      }
    })
  }

  async clearAllMessages(userId?: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')

      let request: IDBRequest
      if (userId) {
        // 只删除指定用户的消息
        const index = store.index('userId')
        const range = IDBKeyRange.only(userId)
        request = index.openCursor(range)

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          }
        }
      } else {
        // 删除所有消息
        request = store.clear()
      }

      transaction.oncomplete = () => {
        console.log('Messages cleared from IndexedDB')
        resolve()
      }

      transaction.onerror = () => {
        console.error('Failed to clear messages:', transaction.error)
        reject(transaction.error)
      }
    })
  }

  // 检查IndexedDB是否支持
  static isSupported(): boolean {
    return typeof indexedDB !== 'undefined'
  }
}

export const chatStorage = new ChatStorageManager()
export { ChatStorageManager }
export default chatStorage