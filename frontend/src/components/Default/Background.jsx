import bg1 from "../../../public/assets/fundo-1.jpg";

const backgroundImagePath = {
  bg1: bg1,

}

export function Background({ image, children }) {
  
  return (
    <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${backgroundImagePath[image]})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          opacity: 0.50,
          mixBlendMode: "multiply",
        }}
      > 
        {children}
    </div>
  );
}
