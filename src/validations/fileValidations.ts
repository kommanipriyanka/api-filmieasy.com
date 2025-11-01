
import * as v from 'valibot'
import { CONTENT_TYPE_REQUIRED, FILE_NAME_REQUIRED } from '../constants/appMessages'
export const  vSignedUrl = v.object({
    name:v.pipe(
        v.string(FILE_NAME_REQUIRED),
        v.nonEmpty(FILE_NAME_REQUIRED)
    ),
    contentType:v.pipe(
        v.string(CONTENT_TYPE_REQUIRED),
        v.nonEmpty(CONTENT_TYPE_REQUIRED)
    )
})