export type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
  details?: Record<string, string>
  meta?: { page: number; perPage: number; total: number }
}

export type Resource = {
  slug: string
  title: string
  description: string
  collection: string
  coverImage: string
  fileUrl: string
  fileName: string
  icon: string
  category?: { slug: string; name: string }
}

export type ResourceGroup = {
  slug: string
  name: string
  resources: Resource[]
}
