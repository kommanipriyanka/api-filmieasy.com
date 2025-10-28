import type { DepartmentTable } from "../database/schemas/department";

import { DEPARTMENT_CREATED } from "../constants/appMessages";
import { departments } from "../database/schemas/department";
import factory from "../factory";
import { saveRecord } from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";

export class departmentHandler {
  createDepartment = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    const Department = await saveRecord<DepartmentTable>(departments, reqData);
    return sendResponse(c, 200, DEPARTMENT_CREATED, Department);
  });
}
