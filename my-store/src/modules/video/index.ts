import VideoModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const VIDEO_MODULE = "video"

export default Module(VIDEO_MODULE, {
  service: VideoModuleService,
})
