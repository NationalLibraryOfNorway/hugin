import {useAuth} from '@/app/AuthProvider';
import {Button} from '@nextui-org/react';
import {FaSignOutAlt} from 'react-icons/fa';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button
      className="edit-button-style"
      endContent={<FaSignOutAlt size={25} />}
      onPress={logout}
    >
      Logg ut
    </Button>
  );
};

export default LogoutButton;