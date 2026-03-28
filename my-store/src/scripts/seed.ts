import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "eur",
          is_default: true,
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Region/Tax seeding can fail if the DB is already initialized.
  // Make it idempotent so we can safely re-run seed for course/lesson data.
  // ──────────────────────────────────────────────────────────────────────────

  logger.info("Seeding region data...");
  let region = null as any;
  try {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Europe",
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
    logger.info("Finished seeding regions.");

    logger.info("Seeding tax regions...");
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
    logger.info("Finished seeding tax regions.");
  } catch (e: any) {
    // If already seeded, skip and continue.
    const msg = e?.message ?? "";
    if (typeof msg === "string" && msg.includes("already assigned to a region")) {
      logger.warn("Regions already seeded. Skipping region/tax seeding.");

      // 尝试读取已存在的 region（按名称获取）
      const regionModuleService = container.resolve(Modules.REGION) as any
      const regions = await regionModuleService.listRegions({ name: "Europe" })
      region = regions?.[0] ?? null

      if (!region) {
        throw new Error("Region Europe already exists but cannot be loaded")
      }
    } else {
      throw e;
    }
  }

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  // link stock location <-> fulfillment provider
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  } catch (e: any) {
    const msg = e?.message ?? ""
    if (typeof msg === "string" && msg.includes("Cannot create multiple links")) {
      logger.warn("Stock location <-> fulfillment provider link already exists. Skipping.")
    } else {
      throw e
    }
  }

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  let fulfillmentSet: any = null
  try {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "European Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: [
            { country_code: "gb", type: "country" },
            { country_code: "de", type: "country" },
            { country_code: "dk", type: "country" },
            { country_code: "se", type: "country" },
            { country_code: "fr", type: "country" },
            { country_code: "es", type: "country" },
            { country_code: "it", type: "country" },
          ],
        },
      ],
    });
  } catch (e: any) {
    const msg = e?.message ?? ""
    if (typeof msg === "string" && msg.includes("already exists")) {
      logger.warn("Fulfillment set already seeded. Skipping fulfillment set create.")
      const existing = await fulfillmentModuleService.listFulfillmentSets({
        name: "European Warehouse delivery",
      })
      fulfillmentSet = existing?.[0] ?? null
      if (!fulfillmentSet) {
        throw new Error("Fulfillment set exists but cannot be loaded")
      }
    } else {
      throw e
    }
  }

  // link stock location <-> fulfillment set
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  } catch (e: any) {
    const msg = e?.message ?? ""
    if (typeof msg === "string" && msg.includes("Cannot create multiple links")) {
      logger.warn("Stock location <-> fulfillment set link already exists. Skipping.")
    } else {
      throw e
    }
  }

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  // 确保 defaultSalesChannel 存在（seed 可重复执行）
  defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });
  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Shirts",
          is_active: true,
        },
        {
          name: "Sweatshirts",
          is_active: true,
        },
        {
          name: "Pants",
          is_active: true,
        },
        {
          name: "Merch",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Medusa T-Shirt",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Shirts")!.id,
          ],
          description:
            "Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.",
          handle: "t-shirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL"],
            },
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          variants: [
            {
              title: "S / Black",
              sku: "SHIRT-S-BLACK",
              options: {
                Size: "S",
                Color: "Black",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "S / White",
              sku: "SHIRT-S-WHITE",
              options: {
                Size: "S",
                Color: "White",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M / Black",
              sku: "SHIRT-M-BLACK",
              options: {
                Size: "M",
                Color: "Black",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M / White",
              sku: "SHIRT-M-WHITE",
              options: {
                Size: "M",
                Color: "White",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L / Black",
              sku: "SHIRT-L-BLACK",
              options: {
                Size: "L",
                Color: "Black",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L / White",
              sku: "SHIRT-L-WHITE",
              options: {
                Size: "L",
                Color: "White",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL / Black",
              sku: "SHIRT-XL-BLACK",
              options: {
                Size: "XL",
                Color: "Black",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL / White",
              sku: "SHIRT-XL-WHITE",
              options: {
                Size: "XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Medusa Sweatshirt",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Sweatshirts")!.id,
          ],
          description:
            "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
          handle: "sweatshirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATSHIRT-S",
              options: {
                Size: "S",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M",
              sku: "SWEATSHIRT-M",
              options: {
                Size: "M",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L",
              sku: "SWEATSHIRT-L",
              options: {
                Size: "L",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL",
              sku: "SWEATSHIRT-XL",
              options: {
                Size: "XL",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Medusa Sweatpants",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Pants")!.id,
          ],
          description:
            "Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.",
          handle: "sweatpants",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATPANTS-S",
              options: {
                Size: "S",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M",
              sku: "SWEATPANTS-M",
              options: {
                Size: "M",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L",
              sku: "SWEATPANTS-L",
              options: {
                Size: "L",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL",
              sku: "SWEATPANTS-XL",
              options: {
                Size: "XL",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Medusa Shorts",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Merch")!.id,
          ],
          description:
            "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.",
          handle: "shorts",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SHORTS-S",
              options: {
                Size: "S",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M",
              sku: "SHORTS-M",
              options: {
                Size: "M",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L",
              sku: "SHORTS-L",
              options: {
                Size: "L",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL",
              sku: "SHORTS-XL",
              options: {
                Size: "XL",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "eur",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");

  // ──────────────────────────────────────────────────────────────────────────
  // Seed course / lesson demo data (MVP)
  // ──────────────────────────────────────────────────────────────────────────
  logger.info("Seeding course & lesson demo data...")

  // 通过 Medusa Query 写入自定义模块表
  // 这里使用 container 的 QUERY + link 风格避免直接依赖静态仓储。
  const courseModule = container.resolve("course") as any

  // 课程
  await courseModule.createCourses([
    {
      id: "course_demo_1",
      handle: "demo-course-1",
      title: "React 从零到一",
      description: "系统学习 React 核心概念，包含 Hooks、状态管理与项目实战。",
      thumbnail_url: "https://via.placeholder.com/640x360?text=React+Course",
      level: "beginner",
      lessons_count: 4,
      status: "published",
      metadata: {},
    },
    {
      id: "course_demo_2",
      handle: "demo-course-2",
      title: "Next.js 全栈开发",
      description: "深入 Next.js App Router，Server Components 与全栈部署实战。",
      thumbnail_url: "https://via.placeholder.com/640x360?text=Next.js+Course",
      level: "intermediate",
      lessons_count: 8,
      status: "published",
      metadata: {},
    },
  ])

  // 课时
  await courseModule.createLessons([
    // course_demo_1
    {
      id: "lesson_c1_1",
      course_id: "course_demo_1",
      title: "第1集：开发环境搭建",
      description: "安装 Node.js、VS Code 并初始化第一个 React 项目。",
      episode_number: 1,
      duration: 600,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+1",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c1_2",
      course_id: "course_demo_1",
      title: "第2集：JSX 与组件基础",
      description: "学习 JSX 语法、函数组件与 Props 传递。",
      episode_number: 2,
      duration: 780,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+2",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c1_3",
      course_id: "course_demo_1",
      title: "第3集：useState 与 useEffect",
      description: "深入理解 React 核心 Hooks 的使用场景与陷阱。",
      episode_number: 3,
      duration: 1200,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+3",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c1_4",
      course_id: "course_demo_1",
      title: "第4集：项目实战 —— Todo App",
      description: "综合运用所学知识，构建一个完整的 Todo 应用并部署上线。",
      episode_number: 4,
      duration: 1800,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+4",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    // course_demo_2
    {
      id: "lesson_c2_1",
      course_id: "course_demo_2",
      title: "第1集：App Router 核心概念",
      description: "理解 Next.js App Router 目录结构与路由规则。",
      episode_number: 1,
      duration: 720,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+1",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_2",
      course_id: "course_demo_2",
      title: "第2集：Server Components vs Client Components",
      description: "掌握两种组件模式的边界与最佳实践。",
      episode_number: 2,
      duration: 900,
      is_free: true,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+2",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_3",
      course_id: "course_demo_2",
      title: "第3集：数据获取与缓存策略",
      description: "fetch 缓存与 revalidate 的使用。",
      episode_number: 3,
      duration: 1050,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+3",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_4",
      course_id: "course_demo_2",
      title: "第4集：Server Actions 全解析",
      description: "使用 Server Actions 处理表单提交与数据变更。",
      episode_number: 4,
      duration: 960,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+4",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_5",
      course_id: "course_demo_2",
      title: "第5集：中间件与鉴权",
      description: "利用 Middleware 实现路由守卫与鉴权。",
      episode_number: 5,
      duration: 1100,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+5",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_6",
      course_id: "course_demo_2",
      title: "第6集：数据库集成 —— PostgreSQL",
      description: "在项目中集成并使用 PostgreSQL。",
      episode_number: 6,
      duration: 1350,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+6",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_7",
      course_id: "course_demo_2",
      title: "第7集：部署",
      description: "部署全栈应用并配置环境变量。",
      episode_number: 7,
      duration: 840,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+7",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
    {
      id: "lesson_c2_8",
      course_id: "course_demo_2",
      title: "第8集：性能优化与监控",
      description: "常用性能优化手段与监控接入。",
      episode_number: 8,
      duration: 1200,
      is_free: false,
      thumbnail_url: "https://via.placeholder.com/320x180?text=Lesson+8",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "published",
      metadata: {},
    },
  ])

  logger.info("Finished seeding course & lesson demo data.")
}
