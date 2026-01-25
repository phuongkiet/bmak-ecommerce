export interface TagDto {
  id: number
  name: string
  description?: string
}

export interface CreateTagCommand {
  name: string
  description?: string
}





