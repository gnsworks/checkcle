
// Calculate days remaining from expiration date
export function calculateDaysRemaining(validTo: string): number {
  try {
    const expirationDate = new Date(validTo);
    const currentDate = new Date();
    const diffTime = expirationDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24)); // Convert ms to days
  } catch (error) {
    console.error("Error calculating days remaining:", error);
    return 0;
  }
}

// Check if the certificate is valid
export function isValid(validTo: string): boolean {
  try {
    return new Date(validTo).getTime() > Date.now();
  } catch (error) {
    console.error("Error checking certificate validity:", error);
    return false;
  }
}