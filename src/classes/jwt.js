const crypto = require("crypto");
const jose = require("jose");

const message = "Unauthorized access!";
// Defining secret Bytes(32)
const CRYPT_SECRET = "7e0d44fd47aaa2f1c42167451140ec6389b7353f8f4d9a95f2f596f2";
// Defining algorithm
const CRYPT_ALGORITHM = "aes-256-cbc";

class Jwt {
  // Singleton instance of the Jwt class
  static i;
  // Security configuration for JWT
  static security = {
    issuer: "urn:example:issuer",
    audience: "urn:example:audience",
  };
  // JWT algorithm
  static alg = "HS256";
  // Expiration time for JWT
  static expirationTime = "1h";
  // Secret key for JWT
  static secret = new TextEncoder().encode(CRYPT_SECRET);

  constructor() {
    if (!!Jwt.i) return Jwt.i;
    Jwt.security = {
      issuer: "urn:example:issuer",
      audience: "urn:example:audience",
    };
  }

  /**
   * Creates a JWT token for the given address.
   * @param {string} address - The address to include in the token.
   * @returns {Object} An object containing the JWT token and a method to set it as a cookie.
   */
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

  /**
   * Extracts the payload from the JWT token in the headers.
   * @param {Object} param0 - The headers object containing the authorization header.
   * @returns {Object} The payload extracted from the JWT token.
   */
  static async extract({ headers }) {
    const { authorization: auth } = headers;
    console.log({ auth });
    if (typeof auth !== "string") throw Error(message);
    if (!auth.length) throw Error(message);
    if (!auth.startsWith("Bearer ")) throw Error(message);

    try {
      const token = auth.replace("Bearer ", "").replace(/\s/g, "");
      const { payload } = await jose.jwtVerify(token, Jwt.secret, Jwt.security);

      return payload;
    } catch ({ message: r65 }) {
      throw Error(`${message} / ${r65}`);
    }
  }

  /**
   * Verifies the JWT token in the headers.
   * @param {Object} param0 - The headers object containing the authorization header.
   * @returns {boolean} A boolean indicating whether the token is valid.
   */
  static async verify({ headers }) {
    const payload = await Jwt.extract({ headers });
    return !!payload;
  }

  /**
   * Sets the JWT token as a cookie in the response.
   * @param {Object} res - The response object.
   * @param {string} jwt - The JWT token to set as a cookie.
   * @param {number} expiresIn - The expiration time for the cookie (in milliseconds).
   * @returns {Object} An object containing the JWT token.
   */
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

  /**
   * Clears the JWT token cookie in the response.
   * @param {Object} res - The response object.
   * @param {string} token - The JWT token to clear.
   */
  static async clearCookie(res, token) {
    token
      .split(".")
      .forEach(async (_, index) => await res.clearCookie(`path[${index}]`));
  }

  /**
   * Encodes data using AES-256-CBC encryption.
   * @param {string} data - The data to encrypt.
   * @param {string} secret - The secret key for encryption.
   * @returns {string} The encrypted data.
   */
  static encode(data, secret = CRYPT_SECRET) {
    const { key, iv } = Jwt.createSecret(secret);
    const cipher = crypto.createCipheriv(CRYPT_ALGORITHM, key, iv);

    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  /**
   * Decrypts data using AES-256-CBC decryption.
   * @param {string} data - The data to decrypt.
   * @param {string} secret - The secret key for decryption.
   * @returns {string} The decrypted data.
   */
  static decode(data, secret = CRYPT_SECRET) {
    const { key, iv } = Jwt.createSecret(secret);
    const decipher = crypto.createDecipheriv(CRYPT_ALGORITHM, key, iv);

    let decrypted = decipher.update(data, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Creates a secret object from the provided secret string.
   * @param {string} secret - The secret string.
   * @returns {Object} An object containing the key and IV for encryption.
   */
  static createSecret(secret = "") {
    if (secret.length < 32) throw new Error("Invalid secret length");
    let decrypted = secret.replace(/\s/g, "");
    const key = Buffer.from(decrypted.substring(0, 32));
    const iv = Buffer.from(decrypted.substring(0, 16));
    return { key, iv };
  }
}

module.exports = Jwt;
