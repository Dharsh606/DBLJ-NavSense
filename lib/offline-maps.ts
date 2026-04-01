// Offline Maps Service with Caching System
// Advanced offline maps with tile caching, route storage, and intelligent synchronization

export interface OfflineMapTile {
  x: number
  y: number
  z: number
  url: string
  cached: boolean
  lastAccessed: number
  size: number
}

export interface OfflineRoute {
  id: string
  name: string
  waypoints: Array<{
    latitude: number
    longitude: number
    instruction: string
    distance?: number
  }>
  totalDistance: number
  estimatedTime: number
  cached: boolean
  lastUsed: number
}

export interface CacheStats {
  totalTiles: number
  cachedTiles: number
  cacheSize: number
  lastCleanup: number
  hitRate: number
}

class OfflineMapsService {
  private cache: Map<string, OfflineMapTile> = new Map()
  private routes: Map<string, OfflineRoute> = new Map()
  private maxCacheSize: number = 1000 // Maximum 1000 tiles
  private maxRoutes: number = 50 // Maximum 50 cached routes
  
  constructor() {
    this.loadCache()
    this.loadRoutes()
  }

  // Routes are loaded from IndexedDB in loadCache().
  private async loadRoutes(): Promise<void> {
    return
  }

  // Initialize offline map system
  async initialize(): Promise<void> {
    try {
      // Create IndexedDB for tile caching
      await this.createCacheDatabase()
      
      // Load cached data
      await this.loadCache()
      await this.loadRoutes()
      
      console.log('Offline maps service initialized')
      console.log(`Cache size: ${this.cache.size} tiles`)
      console.log(`Routes cached: ${this.routes.size} routes`)
      
    } catch (error) {
      console.error('Failed to initialize offline maps:', error)
      throw new Error('Failed to initialize offline maps service')
    }
  }

  // Create IndexedDB for tile caching
  private async createCacheDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineMapsDB', 1)
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }
      
      request.onsuccess = () => {
        const db = request.result
        
        // Create object store for tiles
        if (!db.objectStoreNames.contains('tiles')) {
          db.createObjectStore('tiles', { keyPath: 'url' })
        }
        
        // Create object store for routes
        if (!db.objectStoreNames.contains('routes')) {
          db.createObjectStore('routes', { keyPath: 'id', autoIncrement: true })
        }
        
        resolve()
      }
    })
  }

  // Load cached tiles
  private async loadCache(): Promise<void> {
    try {
      const request = indexedDB.open('OfflineMapsDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        
        // Load tiles
        const tileTransaction = db.transaction(['tiles'], 'readonly')
        const tileStore = tileTransaction.objectStore('tiles')
        
        const tilesRequest = tileStore.getAll()
        tilesRequest.onsuccess = () => {
          const tiles = tilesRequest.result as any[]
          tiles.forEach((tile: any) => {
            this.cache.set(tile.url, {
              x: tile.x,
              y: tile.y,
              z: tile.z,
              url: tile.url,
              cached: tile.cached,
              lastAccessed: tile.lastAccessed,
              size: tile.size
            })
          })
        }
        
        // Load routes
        const routeTransaction = db.transaction(['routes'], 'readonly')
        const routeStore = routeTransaction.objectStore('routes')
        
        const routesRequest = routeStore.getAll()
        routesRequest.onsuccess = () => {
          const routes = routesRequest.result as any[]
          routes.forEach((route: any) => {
            this.routes.set(route.id, {
              id: route.id,
              name: route.name,
              waypoints: route.waypoints,
              totalDistance: route.totalDistance,
              estimatedTime: route.estimatedTime,
              cached: route.cached,
              lastUsed: route.lastUsed
            })
          })
        }
      }
    } catch (error) {
      console.error('Failed to load cache:', error)
    }
  }

  // Save tile to cache
  private async saveTile(tile: OfflineMapTile): Promise<void> {
    try {
      const request = indexedDB.open('OfflineMapsDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['tiles'], 'readwrite')
        const store = transaction.objectStore('tiles')
        
        tile.lastAccessed = Date.now()
        
        const request = store.put(tile)
        request.onsuccess = () => {
          this.cache.set(tile.url, tile)
          this.cleanupOldTiles()
        }
        
        transaction.oncomplete = () => {
          console.log(`Tile cached: ${tile.url}`)
        }
      }
    } catch (error) {
      console.error('Failed to save tile:', error)
    }
  }

  // Save route to cache
  private async saveRoute(route: OfflineRoute): Promise<void> {
    try {
      const request = indexedDB.open('OfflineMapsDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['routes'], 'readwrite')
        const store = transaction.objectStore('routes')
        
        route.cached = true
        route.lastUsed = Date.now()
        
        const request = store.put(route)
        request.onsuccess = () => {
          this.routes.set(route.id, route)
          this.cleanupOldRoutes()
        }
        
        transaction.oncomplete = () => {
          console.log(`Route cached: ${route.name}`)
        }
      }
    } catch (error) {
      console.error('Failed to save route:', error)
    }
  }

  // Get tile from cache or download
  async getTile(x: number, y: number, z: number, url: string): Promise<Blob> {
    // Check cache first
    const cachedTile = this.cache.get(url)
    if (cachedTile && cachedTile.cached) {
      cachedTile.lastAccessed = Date.now()
      return this.fetchTileData(cachedTile.url)
    }

    // Download and cache new tile
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch tile: ${response.status}`)
      }
      
      const blob = await response.blob()
      const tileData: OfflineMapTile = {
        x, y, z, url,
        cached: true,
        lastAccessed: Date.now(),
        size: blob.size
      }
      
      await this.saveTile(tileData)
      return blob
      
    } catch (error) {
      console.error('Failed to get tile:', error)
      throw error
    }
  }

  // Fetch tile data
  private async fetchTileData(url: string): Promise<Blob> {
    const response = await fetch(url)
    return response.blob()
  }

  // Get route from cache
  getRoute(id: string): OfflineRoute | null {
    return this.routes.get(id) || null
  }

  // Get all cached routes
  getAllRoutes(): OfflineRoute[] {
    return Array.from(this.routes.values())
  }

  // Clean up old tiles (LRU eviction)
  private cleanupOldTiles(): void {
    if (this.cache.size <= this.maxCacheSize) return
    
    const tiles = Array.from(this.cache.values())
      .sort((a, b) => a.lastAccessed - b.lastAccessed)
      .slice(0, this.cache.size - this.maxCacheSize)
    
    tiles.forEach(tile => {
      this.cache.delete(tile.url)
    })
    
    // Update cache in IndexedDB
    this.updateCacheDatabase()
    
    console.log(`Cleaned up ${tiles.length} old tiles`)
  }

  // Clean up old routes
  private cleanupOldRoutes(): void {
    if (this.routes.size <= this.maxRoutes) return
    
    const routes = Array.from(this.routes.values())
      .sort((a, b) => a.lastUsed - b.lastUsed)
      .slice(0, this.routes.size - this.maxRoutes)
    
    routes.forEach(route => {
      this.routes.delete(route.id)
    })
    
    // Update routes in IndexedDB
    this.updateRoutesDatabase()
    
    console.log(`Cleaned up ${routes.length} old routes`)
  }

  // Update cache database
  private updateCacheDatabase(): void {
    try {
      const request = indexedDB.open('OfflineMapsDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['tiles'], 'readwrite')
        const store = transaction.objectStore('tiles')
        
        const tiles = Array.from(this.cache.values())
        tiles.forEach(tile => {
          store.put(tile)
        })
        
        transaction.oncomplete = () => {
          console.log(`Cache database updated: ${tiles.length} tiles`)
        }
      }
    } catch (error) {
      console.error('Failed to update cache database:', error)
    }
  }

  // Update routes database
  private updateRoutesDatabase(): void {
    try {
      const request = indexedDB.open('OfflineMapsDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['routes'], 'readwrite')
        const store = transaction.objectStore('routes')
        
        const routes = Array.from(this.routes.values())
        routes.forEach(route => {
          store.put(route)
        })
        
        transaction.oncomplete = () => {
          console.log(`Routes database updated: ${routes.length} routes`)
        }
      }
    } catch (error) {
      console.error('Failed to update routes database:', error)
    }
  }

  // Get cache statistics
  getCacheStats(): CacheStats {
    const tiles = Array.from(this.cache.values())
    const cachedTiles = tiles.filter(tile => tile.cached)
    
    return {
      totalTiles: tiles.length,
      cachedTiles: cachedTiles.length,
      cacheSize: this.calculateCacheSize(),
      hitRate: this.calculateHitRate(),
      lastCleanup: Date.now()
    }
  }

  // Calculate cache size
  private calculateCacheSize(): number {
    let totalSize = 0
    this.cache.forEach(tile => {
      totalSize += tile.size || 0
    })
    return totalSize
  }

  // Calculate cache hit rate
  private calculateHitRate(): number {
    const tiles = Array.from(this.cache.values())
    const cachedTiles = tiles.filter(tile => tile.cached)
    
    if (cachedTiles.length === 0) return 0
    return (cachedTiles.length / tiles.length) * 100
  }

  // Clear cache
  async clearCache(): Promise<void> {
    try {
      const request = indexedDB.open('OfflineMapsDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        
        // Clear tiles
        const tileTransaction = db.transaction(['tiles'], 'readwrite')
        const tileStore = tileTransaction.objectStore('tiles')
        tileStore.clear()
        
        // Clear routes
        const routeTransaction = db.transaction(['routes'], 'readwrite')
        const routeStore = routeTransaction.objectStore('routes')
        routeStore.clear()
        
        routeTransaction.oncomplete = () => {
          this.cache.clear()
          this.routes.clear()
          console.log('Cache cleared successfully')
        }
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  // Preload tiles for area
  async preloadArea(centerLat: number, centerLng: number, radiusKm: number): Promise<void> {
    const tiles = this.getTilesInArea(centerLat, centerLng, radiusKm)
    
    console.log(`Preloading ${tiles.length} tiles for area`)
    
    // Load tiles in parallel
    const promises = tiles.map(tile => this.getTile(tile.x, tile.y, tile.z, tile.url))
    
    try {
      await Promise.all(promises)
      console.log('Area preload completed')
    } catch (error) {
      console.error('Failed to preload area:', error)
    }
  }

  // Get tiles in specific area
  private getTilesInArea(centerLat: number, centerLng: number, radiusKm: number): Array<{x: number, y: number, z: number, url: string}> {
    const tiles = []
    const zoom = 15 // Typical zoom level for street-level detail
    const tileSize = 256 // 256x256 pixel tiles
    
    // Calculate tile coordinates for area
    const latDelta = (radiusKm * 1000) / 111.32 // Approximate km to degrees
    const lngDelta = latDelta / Math.cos(centerLat * Math.PI / 180)
    
    for (let x = -radiusKm; x <= radiusKm; x++) {
      for (let y = -radiusKm; y <= radiusKm; y++) {
        const tileX = Math.floor((centerLng + x * lngDelta) * Math.pow(2, zoom) / 256) + 128
        const tileY = Math.floor((centerLat - y * latDelta) * Math.pow(2, zoom) / 256) + 128
        
        tiles.push({
          x: tileX,
          y: tileY,
          z: zoom,
          url: `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`
        })
      }
    }
    
    return tiles
  }

  // Get service status
  getStatus(): {
    cacheSize: number
    cachedTiles: number
    routesCount: number
    isInitialized: boolean
  } {
    return {
      cacheSize: this.calculateCacheSize(),
      cachedTiles: Array.from(this.cache.values()).filter(tile => tile.cached).length,
      routesCount: this.routes.size,
      isInitialized: this.cache.size > 0 || this.routes.size > 0
    }
  }

  // Cleanup resources
  dispose(): void {
    this.cache.clear()
    this.routes.clear()
    console.log('Offline maps service disposed')
  }
}

// Export singleton instance
export const offlineMapsService = new OfflineMapsService()
