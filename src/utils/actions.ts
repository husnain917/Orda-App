
export const createType = (typePrefix) => ({
  SET: `${typePrefix}_SET`
})

export const createTypes = (typePrefix) => ({
  DO: `${typePrefix}_DO`,
  PROGRESS: `${typePrefix}_PROGRESS`,
  SUCCESS: `${typePrefix}_SUCCESS`,
  PENDING: `${typePrefix}_PENDING`,
  FAILED: `${typePrefix}_FAILED`,
});
export const createSetTypes = (typePrefix) => ({
  SET: `${typePrefix}_SET`,
  CLEAR: `${typePrefix}_CLEAR`,
});

export const createAction = (type, args) => ({
  ...args,
  type,
});

export const transformNetworkError = (error) => {
  if (!error.response) {
    return {
      status: 404,
      statusText: error.message
    }
  }
  return {
    status: error.response.status,
    statusText: error.response.statusText || "Something went wrong, Please try again."
  }
};

export const socialLoginError = (error) => {
  return {
    status: error.status,
    statusText: error.message || "Something went wrong, Please try again."
  }
};
