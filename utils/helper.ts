import {sign} from "jsonwebtoken";


export const genToken = (user: { id: string; validity: string }) => {
    const token = sign({ id: user.id }, process.env.TOKEN_SECRET as string, {
      expiresIn: user.validity,
    });
    return token;
  };