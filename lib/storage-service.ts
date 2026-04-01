import { isBrowser } from '@/lib/browser-utils'

type JsonValue = unknown

class StorageService {
  private memoryStore = new Map<string, string>()

  get<T = JsonValue>(key: string, fallback: T): T {
    try {
      const raw = this.read(key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  set<T = JsonValue>(key: string, value: T): void {
    const encoded = JSON.stringify(value)
    if (isBrowser()) {
      localStorage.setItem(key, encoded)
      return
    }
    this.memoryStore.set(key, encoded)
  }

  remove(key: string): void {
    if (isBrowser()) {
      localStorage.removeItem(key)
      return
    }
    this.memoryStore.delete(key)
  }

  private read(key: string): string | null {
    if (isBrowser()) return localStorage.getItem(key)
    return this.memoryStore.get(key) ?? null
  }
}

export const storageService = new StorageService()

