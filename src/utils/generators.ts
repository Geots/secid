/**
 * Utility functions for generating random data
 */

/**
 * Generates a random ID string
 */
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
}

/**
 * Generates random text of given length
 */
export function generateRandomText(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generates a random number between min and max (inclusive)
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random boolean value
 */
export function generateRandomBoolean(): boolean {
  return Math.random() > 0.5;
}

/**
 * Generates a random date between start and end date
 */
export function generateRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

/**
 * Generates a random element from an array
 */
export function generateRandomArrayElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a random subset of an array
 */
export function generateRandomSubset<T>(array: T[], size: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
} 