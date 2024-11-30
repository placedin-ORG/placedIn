import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function EmailSentPage() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/user/profile");
    }
  }, []);
  return (
    <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-6 sm:py-12 ">
      <div class="max-w-xl px-5 text-center">
        <h2 class="mb-2 text-[42px] font-bold text-zinc-800">
          Check your inbox
        </h2>
        <p class="mb-2 text-lg text-zinc-500">
          We are glad, that you’re with us ? We’ve sent you a verification link
          to your email address{" "}
        </p>
      </div>
    </div>
  );
}

export default EmailSentPage;
