// src/types/express.d.ts
import { IUser } from '../interfaces/user.interfaces' // tu interfaz de usuario

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}