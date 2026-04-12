import { MedusaService } from "@medusajs/framework/utils"
import PasswordResetToken from "./models/password-reset-token"

class PasswordResetModuleService extends MedusaService({
  PasswordResetToken,
}) {}

export default PasswordResetModuleService
