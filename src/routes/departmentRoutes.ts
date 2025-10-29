import factory from "../factory";
import { DepartmentHandler } from "../handlers/departmentHandlers";

const departmentHandler = new DepartmentHandler();
export const departmentRoutes = factory.createApp();
departmentRoutes.post("/", ...departmentHandler.createDepartment);
departmentRoutes.get("/", ...departmentHandler.listDepartments);
