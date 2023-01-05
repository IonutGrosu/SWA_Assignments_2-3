import {
  CLEAR_CURRENT,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  MESSAGE_ERROR,
  MESSAGE_SUCCESS,
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  SET_MESSAGE,
  SET_USER,
} from "./types";

import AuthService from "../services/auth.service";

export const register = (username: string, password: string) => (dispatch: any) => {
    AuthService.register(username, password).then(
      (response) => {
        dispatch({
            type: REGISTER_SUCCESS,
        });
  
        dispatch({
          type: SET_MESSAGE,
          payload: {
           message: `Account created successfully`,
           type: MESSAGE_SUCCESS,
          },
        });
  
        return Promise.resolve();
      },
      (error) => {
        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: REGISTER_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: {
          message,
          type: MESSAGE_ERROR,
        },
      });
      return Promise.reject();
    }
  );
};
export const login = (username: string, password: string) => (dispatch: any) => {
    return AuthService.login(username, password).then(
      (data) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: { user: data },
        });
        return Promise.resolve();
    },
    (error) => {
      let message;
      if (error.message.includes(`403`)) {
        message = `Invalid login or password`;
      }

      if (!error.message.includes(`403`)) {
        message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }

      dispatch({
        type: LOGIN_FAIL,
      });

      dispatch({
        type: SET_MESSAGE,
        payload: {
          message,
          type: MESSAGE_ERROR,
        },
      });

      return Promise.reject();
    }
  );
};

export const loadUserData = (userId: number) => (dispatch: any)  => {
  return AuthService.getUser(userId).then(
    (response) => {
        dispatch({
            type: SET_USER,
            payload: {
              username: response.username,
              password: response.password,
            }
        });

        return Promise.resolve();
    },
    (error) => {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            error.toString();
        dispatch({
            type: SET_MESSAGE,
            payload: {
              message,
              type: MESSAGE_ERROR,
            },
        });
        return Promise.reject();
    }
);

}

export const updateUserProfile = (accountId: number, body: any) => (dispatch: any) => {
    return AuthService.updateUser(accountId, body).then(
        (response) => {

            dispatch({
                type: SET_MESSAGE,
                payload: {
                  message: `Account updated successfully`,
                  type: MESSAGE_SUCCESS,
                },
            });

            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();

            dispatch({
                type: SET_MESSAGE,
                payload: {
                  message,
                  type: MESSAGE_ERROR,
                },
            });
            return Promise.reject();
        }
    );
}

  export const logout = () => (dispatch: any) => {
    AuthService.logout();
  
    dispatch({
      type: CLEAR_CURRENT,
    });

    dispatch({
      type: LOGOUT,
    });
  };