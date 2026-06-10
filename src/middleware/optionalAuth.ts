import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

const optionalAuth = async (req: any, res: any, next: any) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
      const user = await User.findById(decoded.id).select("-password -confirmado -token -__v");
      if (user) req.user = user; // attach if found, but don't block
    } catch (error) {
      // invalid token? just ignore, don't block
    }
  }
  next(); // always continue
};

export default optionalAuth;