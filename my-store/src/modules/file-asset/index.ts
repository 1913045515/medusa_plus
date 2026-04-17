import { Module } from "@medusajs/framework/utils"
import FileAssetModuleService from "./service"

export const FILE_ASSET_MODULE = "fileAsset"

export default Module(FILE_ASSET_MODULE, {
  service: FileAssetModuleService,
})
