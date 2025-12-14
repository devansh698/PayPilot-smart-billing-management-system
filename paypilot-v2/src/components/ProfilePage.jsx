// ProfilePage is now merged with Settings - redirect to Settings
import { Navigate } from 'react-router-dom';

const ProfilePage = () => {
  return <Navigate to="/settings" replace />;
};

export default ProfilePage;