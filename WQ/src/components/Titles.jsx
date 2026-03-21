import titleImage from "@/Assets/titles.png";

export default function Titles({ property1 = "default", className = "" }) {
  const widthClassMap = {
    default: "w-[220px] md:w-[300px]",
    hero: "w-[240px] md:w-[359px]",
    footer: "w-[180px] md:w-[243px]",
  };

  return (
    <div className={`${widthClassMap[property1] || widthClassMap.default} ${className}`}>
      <img src={titleImage.src} alt="Write Quest" className="h-auto w-full" />
    </div>
  );
}
