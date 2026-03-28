import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VIDEO_MODULE } from "../../../../../modules/video"
import VideoModuleService from "../../../../../modules/video/service"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  // 临时使用静态 JSON 测试数据，以便快速验证页面
  const mockLessons = [
    {
      id: "lesson_1",
      product_id: id,
      title: "第1集：环境搭建",
      episode_number: 1,
      duration: 600,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180",
    },
    {
      id: "lesson_2",
      product_id: id,
      title: "第2集：基础语法",
      episode_number: 2,
      duration: 800,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180",
    },
    {
      id: "lesson_3",
      product_id: id,
      title: "第3集：进阶实战 (VIP)",
      episode_number: 3,
      duration: 1500,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180",
    },
    {
      id: "lesson_4",
      product_id: id,
      title: "第4集：项目部署 (VIP)",
      episode_number: 4,
      duration: 1200,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180",
    }
  ]

  res.json({
    lessons: mockLessons,
  })
}
