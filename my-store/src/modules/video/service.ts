import { MedusaService } from "@medusajs/framework/utils"
import VideoLesson from "./models/video-lesson"

class VideoModuleService extends MedusaService({
  VideoLesson,
}) {}

export default VideoModuleService
