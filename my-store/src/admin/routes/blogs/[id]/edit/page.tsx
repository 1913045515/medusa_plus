import { Navigate, useParams } from "react-router-dom"

// Redirect /blogs/:id/edit to /blogs/:id (standard admin route pattern)
export default function BlogEditRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={"/blogs/" + id} replace />
}