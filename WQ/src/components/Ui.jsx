import playButton from "@/Assets/play_btn.svg";
import tryDemoButton from "@/Assets/trydemo.svg";
import signupButton from "@/Assets/signup.svg";

export default function Ui({
  property1 = "button",
  children,
  onClick,
  className = "",
  type = "button",
  inputValue = "",
  inputOnChange,
  inputOnKeyDown,
  inputPlaceholder = "Enter your email",
  submitDisabled = false,
  submitLabel = "Sign up",
}) {
  if (property1 === "play-1") {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`relative h-[96px] w-[92px] transition-transform duration-150 hover:scale-105 md:h-[136px] md:w-[130px] ${className}`}
      >
        <img src={playButton.src} alt="Play button" className="h-full w-full object-contain" />
      </button>
    );
  }

  if (property1 === "two") {
    return (
      <div className={`flex w-full max-w-[760px] items-center gap-3 ${className}`}>
        <input
          type="email"
          value={inputValue}
          onChange={inputOnChange}
          onKeyDown={inputOnKeyDown}
          placeholder={inputPlaceholder}
          className="h-11 flex-1 rounded-full border-2 border-[#583517] bg-[#fff9e2] px-5 text-lg font-medium text-[#53280d] outline-none"
        />
        <button
          type={type}
          onClick={onClick}
          disabled={submitDisabled}
          className="h-11 w-[250px] transition-transform duration-150 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <img src={signupButton.src} alt={submitLabel} className="h-full w-full object-contain" />
        </button>
      </div>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`relative h-[59.85px] w-[321.67px] transition-all duration-150 hover:-translate-y-[1px] hover:brightness-105 ${className}`}
    >
      <img src={tryDemoButton.src} alt={typeof children === "string" ? children : "Try the demo"} className="h-full w-full object-contain" />
    </button>
  );
}
