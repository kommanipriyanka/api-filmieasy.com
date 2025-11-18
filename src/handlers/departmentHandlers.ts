import  { Context } from "hono";

import  { departments, DepartmentTable } from "../database/schemas/department";
import  { User } from "../database/schemas/users";

import { DEPARTMENT_CREATED, DEPARTMENT_EXISTS, DEPARTMENTS_FETCHED } from "../constants/appMessages";
import ConflictException from "../exceptions/conflictException";
import factory from "../factory";
import { getSingleRecordByMultipleColumnValues, saveRecord } from "../services/baseDbServices";
import { getDepartments } from "../services/userServices";
import { sendResponse } from "../utils/sendResponse";
import { vDepartmentSchema } from "../validations/departmentValidations";
import { validateRequestBody } from "../validations/validateRequest";

export class DepartmentHandler {
  createDepartment = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();
    const user: User = c.get("user_payload");
    const validatedReqData = validateRequestBody(vDepartmentSchema, reqData);
    const isDepartmentExists = await getSingleRecordByMultipleColumnValues<DepartmentTable>(departments, ["name", "created_by"], ["=", "="], [validatedReqData.name, user.id]);
    if (isDepartmentExists) {
      throw new ConflictException(DEPARTMENT_EXISTS);
    }
    const department = await saveRecord<DepartmentTable>(departments, { ...validatedReqData, created_by: user.id });
    return sendResponse(c, 200, DEPARTMENT_CREATED, department);
  });

  listDepartments = factory.createHandlers(async (c: Context) => {
    const user: User = c.get("user_payload");
    const result = await getDepartments(user.id);
    return sendResponse(c, 200, DEPARTMENTS_FETCHED, { records: result });
  });
}
