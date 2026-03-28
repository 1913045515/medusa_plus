import { MedusaService } from "@medusajs/framework/utils"

import Course from "./models/course"
import Lesson from "./models/lesson"
import CoursePurchase from "./models/course-purchase"
import HomepageContent from "./models/homepage-content"

class CourseModuleService extends MedusaService({
  Course,
  Lesson,
  CoursePurchase,
  HomepageContent,
}) {}

export default CourseModuleService
