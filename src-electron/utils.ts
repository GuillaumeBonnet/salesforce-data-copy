const errorMsg = (error: unknown) => {
  if (typeof error == 'string') {
    return error;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return JSON.stringify(error || 'empty error');
  }
};

export { errorMsg };
