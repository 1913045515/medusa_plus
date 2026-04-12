import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_SETTINGS_MODULE } from "../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../modules/store-settings/service"
import {
  DEFAULT_EMAIL_TEMPLATES,
  EmailTemplatesConfig,
} from "../../../../modules/store-settings/email-template-defaults"

async function getOrCreate(service: StoreSettingsModuleService) {
  const list = await service.listStoreSettings()
  if (list.length > 0) return list[0]
  return service.createStoreSettings({ cart_enabled: true })
}

function parseTemplates(setting: any): EmailTemplatesConfig {
  if ((setting as any).email_templates_config) {
    try {
      return JSON.parse((setting as any).email_templates_config)
    } catch {
      // fall through
    }
  }
  return DEFAULT_EMAIL_TEMPLATES
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const setting = await getOrCreate(service)
  res.json({ email_templates: parseTemplates(setting) })
}

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const body = req.body as { email_templates: EmailTemplatesConfig }

  if (!body.email_templates) {
    return res.status(400).json({ message: "email_templates is required" })
  }

  const setting = await getOrCreate(service)
  await service.updateStoreSettings({
    id: setting.id,
    email_templates_config: JSON.stringify(body.email_templates),
  } as any)

  res.json({ email_templates: body.email_templates })
}
