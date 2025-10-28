import { DEF_401, NAME_401 } from "../constants/appMessages";
import BaseException from "./baseException";

class UnAuthorizedException extends BaseException {
  constructor(message: string) {
    super(401, message || DEF_401, NAME_401, true);
  }
}

export default UnAuthorizedException;
