/* eslint-disable import/no-anonymous-default-export */
import { CLEAR_MESSAGE, SET_MESSAGE } from "../actions/types";

const initialState = {};

export default function (state = initialState, action: any) {
  const { type, payload } = action;

  switch (type) {
    case SET_MESSAGE:
      return { 
        message: payload.message,
        type: payload.type, 
      };

    case CLEAR_MESSAGE:
      return { 
        message: null,
        type: null, 
      };

    default:
      return state;
  }
}