import {useAuth} from '@/app/AuthProvider';
import {FaSignOutAlt} from 'react-icons/fa';
import AccessibleButton from '@/components/ui/AccessibleButton';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <AccessibleButton
      variant='flat'
      color='secondary'
      endContent={<FaSignOutAlt size={18} />}
      onClick={logout}
    >
      Logg ut
    </AccessibleButton>
  );
};

export default LogoutButton;