export interface BlogRequest {
  title: string;
  content: string;
  image: string;
  collaborators?: string[];
  categoryId: string;
}
