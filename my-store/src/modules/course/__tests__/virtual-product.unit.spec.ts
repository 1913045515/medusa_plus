import {
  buildCourseRelativePath,
  buildVirtualOrderFulfillmentSnapshot,
  mergeOrderLineVirtualMetadata,
  mergeVirtualProductMetadata,
  readVirtualOrderFulfillmentSnapshot,
  readVirtualProductConfig,
  validateVirtualProductInput,
} from "../../virtual-product"

describe("virtual-product helpers", () => {
  it("validates resource virtual products", () => {
    const config = validateVirtualProductInput({
      is_virtual: true,
      virtual_product_type: "resource",
      resource_download_url: " https://example.com/file.zip ",
    })

    expect(config).toEqual({
      is_virtual: true,
      virtual_product_type: "resource",
      resource_download_url: "https://example.com/file.zip",
      virtual_course_id: null,
      virtual_course_path: null,
    })
  })

  it("requires course id for course virtual products", () => {
    expect(() =>
      validateVirtualProductInput({
        is_virtual: true,
        virtual_product_type: "course",
      })
    ).toThrow("virtual_course_id is required")
  })

  it("merges and reads product virtual metadata", () => {
    const metadata = mergeVirtualProductMetadata(
      { course_id: "course_demo_1" },
      {
        is_virtual: true,
        virtual_product_type: "course",
        resource_download_url: null,
        virtual_course_id: "course_demo_1",
        virtual_course_path: "/courses/demo-course-1",
      }
    )

    expect(readVirtualProductConfig(metadata)).toEqual({
      is_virtual: true,
      virtual_product_type: "course",
      resource_download_url: null,
      virtual_course_id: "course_demo_1",
      virtual_course_path: "/courses/demo-course-1",
    })
  })

  it("builds and stores order fulfillment snapshot", () => {
    const snapshot = buildVirtualOrderFulfillmentSnapshot({
      is_virtual: true,
      virtual_product_type: "resource",
      resource_download_url: "https://example.com/file.zip",
      virtual_course_id: null,
      virtual_course_path: null,
    })

    const metadata = mergeOrderLineVirtualMetadata({}, snapshot)

    expect(readVirtualOrderFulfillmentSnapshot(metadata)).toEqual(snapshot)
  })

  it("builds course relative path", () => {
    expect(buildCourseRelativePath("demo-course-1")).toBe("/courses/demo-course-1")
  })
})