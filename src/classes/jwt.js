const crypto = require("crypto");
const jose = require("jose");

const message = "Unauthorized access!";
// Defining secret Bytes(32)
const CRYPT_SECRET = "7e0d44fd47aaa2f1c42167451140ec6389b7353f8f4d9a95f2f596f2";
// Defining algorithm
const CRYPT_ALGORITHM = "aes-256-cbc";

class Jwt {
  static i;
  static security = {
    issuer: "urn:example:issuer",
    audience: "urn:example:audience",
  };
  static alg = "HS256";
  static expirationTime = "1h";
  static secret = new TextEncoder().encode(CRYPT_SECRET);

  constructor() {
    if (!!Jwt.i) return Jwt.i;
    Jwt.security = {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience",
    };
  }

  static async create(address) {
    const jwt = await new jose.SignJWT({ address })
      .setProtectedHeader({ alg: Jwt.alg })
      .setIssuedAt()
      .setIssuer(Jwt.security.issuer)
      .setAudience(Jwt.security.audience)
      .setExpirationTime(Jwt.expirationTime)
      .sign(Jwt.secret);
    return {
      jwt,
      setCookie: function (res, expInHours = 1) {
        return Jwt.setCookie(res, jwt, 60 * expInHours * 60000);
      },
    };
  }

  static async extract({ headers }) {
    const { authorization: auth } = headers;
    console.log({ auth });
    if (typeof auth !== "string") throw Error(message);
    if (!auth.length) throw Error(message);
    if (!auth.startsWith("Bearer ")) throw Error(message);

    try {
      const token = auth.replace("Bearer ", "").replace(/['"]+/g, "");
      const { payload } = await jose.jwtVerify(token, Jwt.secret, Jwt.security);

      return payload;
    } catch ({ message: r65 }) {
      throw Error(`${message} / ${r65}`);
    }
  }

  static async verify({ headers }) {
    const payload = await Jwt.extract({ headers });
    return !!payload;
  }

  static async setCookie(res, jwt, expiresIn = 60 * 1 * 60000) {
    const options = { maxAge: expiresIn, httpOnly: true, sameSite: "strict" };
    jwt
      .split(".")
      .forEach(
        async (step, index) =>
          await res.cookie(`path[${index}]`, "has_" + Jwt.encode(step), options)
      );
    res.setHeader("authorization", jwt);
    return { jwt: String(jwt) };
  }

  static async clearCookie(res, token) {
    token
      .split(".")
      .forEach(async (_, index) => await res.clearCookie(`path[${index}]`));
  }

  static encode(data, secret = CRYPT_SECRET) {
    const { key, iv } = Jwt.createSecret(secret);
    const cipher = crypto.createCipheriv(CRYPT_ALGORITHM, key, iv);

    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  static decode(data, secret = CRYPT_SECRET) {
    const { key, iv } = Jwt.createSecret(secret);
    const decipher = crypto.createDecipheriv(CRYPT_ALGORITHM, key, iv);

    let decrypted = decipher.update(data, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  static createSecret(secret = "") {
    if (secret.length < 32) throw new Error("Invalid secret length");
    let decrypted = secret.replace(/ /g, "");
    const key = Buffer.from(decrypted.substring(0, 32));
    const iv = Buffer.from(decrypted.substring(0, 16));
    return { key, iv };
  }
}

module.exports = Jwt;
