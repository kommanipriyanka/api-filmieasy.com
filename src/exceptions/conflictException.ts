import { DEF_409, NAME_409 } from "../constants/appMessages";
import BaseException from "./baseException";

class ConflictException extends BaseException {
  constructor(message?: string) {
    super(409, message || DEF_409, NAME_409, true);
  }
}

export default ConflictException;
