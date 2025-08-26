export default function checkAuth(userId) {
  if (!userId) {
    throw new Error('Unauthorized. Please login first.');
  }
  return userId;
}
