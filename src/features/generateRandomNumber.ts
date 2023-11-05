export default function generateRandomNumber(
  min: number = 100000000000000,
  max: number = 999999999999999
) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
