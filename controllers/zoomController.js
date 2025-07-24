import axios from 'axios';
import { getZoomAccessToken } from '../helpers/zoomAuth.js';

export const createZoomMeeting = async (req, res) => {
  const { topic, type, startTime } = req.body;

  try {
    const accessToken = await getZoomAccessToken();

    const meetingData = {
      topic: topic || "Instant Meeting",
      type: type === 'scheduled' ? 2 : 1,
      ...(type === 'scheduled' && {
        start_time:startTime,
      }),
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        approval_type: 0,
        registration_type: 1,
        enforce_login: false,
        waiting_room: false,
        meeting_authentication: false,
        password: "",
      }
    };

    const response = await axios.post(
      `https://api.zoom.us/v2/users/me/meetings`,
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.json({
      meetingLink: response.data.join_url,
      meetingId: response.data.id,
      topic: response.data.topic,
      startTime: response.data.start_time,
    });
  } catch (error) {
    console.error('Zoom meeting creation error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to create Zoom meeting' });
  }
};

