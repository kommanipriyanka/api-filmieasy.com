import factory from "../factory";
import { DepartmentHandler } from "../handlers/departmentHandlers";
import { isAuthorized } from "../middlewares/isAuthorized";

const departmentHandler = new DepartmentHandler();
export const departmentRoutes = factory.createApp();
departmentRoutes.post("/", isAuthorized, ...departmentHandler.createDepartment);
departmentRoutes.get("/", isAuthorized, ...departmentHandler.listDepartments);
