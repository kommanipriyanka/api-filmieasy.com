import * as argon2 from "argon2";

import type { UserTable } from "../database/schemas/users";

import { INVALID_PASSWORD, USER_EXISTS, USER_LOGIN, USER_NOT_FOUND, USER_REGISTERED } from "../constants/appMessages";
import { users } from "../database/schemas/users";
import BadRequestException from "../exceptions/badRequestException";
import ConflictException from "../exceptions/conflictException";
import NotFoundException from "../exceptions/notFoundException";
import factory from "../factory";
import { getSingleRecordByAColumnValue, saveRecord } from "../services/baseDbServices";
import { genJWTTokensForUser } from "../utils/jwtUtils";
import { sendResponse } from "../utils/sendResponse";
import { vLoginUser, vSignUpUser } from "../validations/userValidations";
import { validateRequestBody } from "../validations/validateRequest";

export class UserHandler {
  signUp = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    const validatedReqData = validateRequestBody(vSignUpUser, reqData);
    const existingUser = await getSingleRecordByAColumnValue(users, "email", "=", validatedReqData.email);
    if (existingUser) {
      throw new ConflictException(USER_EXISTS);
    }
    const hashedPassword = await argon2.hash(validatedReqData.password);
    const { password, ...signUp } = await saveRecord<UserTable>(users, { ...validatedReqData, password: hashedPassword });
    return sendResponse(c, 200, USER_REGISTERED, signUp);
  });

  login = factory.createHandlers(async (c) => {
    const reqData = await c.req.json();
    const validatedReqData = validateRequestBody(vLoginUser, reqData);
    const existingUser = await getSingleRecordByAColumnValue(users, "email", "=", validatedReqData.email);
    if (!existingUser) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    const isPasswordValid = await argon2.verify(existingUser.password!, validatedReqData.password);
    if (!isPasswordValid) {
      throw new BadRequestException(INVALID_PASSWORD);
    }
    const { password, ...userDetails } = existingUser;
    const { access_token, refresh_token } = await genJWTTokensForUser(existingUser.id);
    const data = { userDetails, access_token, refresh_token };
    return sendResponse(c, 200, USER_LOGIN, data);
  });
}
