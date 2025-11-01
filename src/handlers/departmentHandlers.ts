import type { DepartmentTable } from "../database/schemas/department";
import type { WhereQueryData } from "../types/dbTypes";

import { DEPARTMENT_CREATED, DEPARTMENT_EXISTS, DEPARTMENTS_FETCHED } from "../constants/appMessages";
import { departments } from "../database/schemas/department";
import ConflictException from "../exceptions/conflictException";
import factory from "../factory";
import { getRecordsConditionally, getSingleRecordByAColumnValue, saveRecord } from "../services/baseDbServices";
import { sendResponse } from "../utils/sendResponse";
import { vDepartmentSchema } from "../validations/departmentValidations";
import { validateRequestBody } from "../validations/validateRequest";

export class DepartmentHandler {
  createDepartment = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    const validatedReqData = validateRequestBody(vDepartmentSchema, reqData);
    const isDepartmentExists = await getSingleRecordByAColumnValue<DepartmentTable>(departments, "name", "=", validatedReqData.name);
    if (isDepartmentExists) {
      throw new ConflictException(DEPARTMENT_EXISTS);
    }
    const department = await saveRecord<DepartmentTable>(departments, validatedReqData);
    return sendResponse(c, 200, DEPARTMENT_CREATED, department);
  });

  listDepartments = factory.createHandlers(async (c) => {
    const search_string = c.req.query("search_string");
    let whereQueryData: WhereQueryData<DepartmentTable> | undefined;
    if (search_string) {
      whereQueryData = {
        columns: ["name"],
        relations: ["ILIKE"],
        values: [`%${search_string}%`],
      };
    }
    const result = await getRecordsConditionally<DepartmentTable>(departments, whereQueryData);
    return sendResponse(c, 200, DEPARTMENTS_FETCHED, { records: result });
  });
}
