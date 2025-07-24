import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function getZoomAccessToken() {
  const tokenURL = 'https://zoom.us/oauth/token';

  const auth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      `${tokenURL}?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching Zoom access token:', error.response?.data || error.message);
    throw error;
  }
}
