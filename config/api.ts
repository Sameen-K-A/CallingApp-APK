const IP_ADDRESS = '192.168.1.2'

export const API_CONFIG = {
  BASE_URL: `http://${IP_ADDRESS}:8000`,
  SOCKET_URL: `http://${IP_ADDRESS}:8000`,

  ENDPOINTS: {
    // Auth
    SEND_OTP: '/auth/send',
    RESEND_OTP: '/auth/resend',
    VERIFY_OTP: '/auth/verify',

    // User
    GET_ME: '/users/me',
    COMPLETE_PROFILE: '/users/complete-profile',
    EDIT_PROFILE: '/users/edit-profile',
    GET_PLANS: '/users/plans',
    GET_FAVORITES: '/users/favorites',
    ADD_FAVORITE: '/users/favorites',
    REMOVE_FAVORITE: '/users/favorites',
    GET_TELECALLERS: '/users/telecallers',

    // Telecaller
    TELE_EDIT_PROFILE: '/telecaller/edit-profile',
  },
}