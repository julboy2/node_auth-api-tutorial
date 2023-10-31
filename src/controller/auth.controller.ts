import {Request , Response} from "express"
import { CreateSessionInput } from "../schema/auth.schema";
import {findByUserEmail, findUserById} from "../service/user.service"
import { findSessionById, signAccessToken, signRefreshToken } from "../service/auth.service";
import { get } from "lodash";
import { verifyJwt } from "../utils/jwt";

export async function createSessionHandler(
    req: Request<{},{}, CreateSessionInput> ,
    res: Response
){

    const message = "Invalid email or password"
    const { email , password} = req.body

    const user = await findByUserEmail(email)

    if(!user){
        return res.send(message)
    }

    if(!user.verified){
        return res.send("Please verify your email")

    }
    const isValid = await user.validatePassword(password)

    if(!isValid){
        return res.send(message)
    }

    // sign a access token
    const accessToken = signAccessToken(user)

    // sign a refresh token
    const refreshToken = await signRefreshToken({ userId: user._id });

    // send the tokens
    return res.send({
        accessToken,
        refreshToken,
      });
}


export async function refreshAccessTokenHandler(req: Request, res: Response){
    const refreshToken = get(req, "headers.x-refresh");

  const decoded = verifyJwt<{ session: string }>(
    refreshToken?.toString() || "",
    "refreshTokenPublicKey"
  );

  if(!decoded){
    return res.status(401).send("Could not refresh access token")
  }

  const session = await findSessionById(decoded.session)

  if(!session || !session.valid){
    return res.status(401).send("Could not refresh access token")
  }

    const user = await findUserById(String(session.user))

    if(!user){
        return res.status(401).send("Could not refresh access user")
    }

    const accessToken = signAccessToken(user)

    return res.send({accessToken})

}