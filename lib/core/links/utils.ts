import { customAlphabet } from "nanoid";

export const generateShortLink = () => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 9);

  const shortLink = nanoid();

  return shortLink;
};
