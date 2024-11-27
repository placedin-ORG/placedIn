import toast from "react-hot-toast";

function error(error) {
  toast.error(
    error?.response?.data?.message
      ? error.response.data.message
      : "Something went wrong"
  );
}

function success(message) {
  toast.success(message);
}

export const tst = { error, success };
