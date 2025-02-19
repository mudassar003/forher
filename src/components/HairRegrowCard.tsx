import Image from "next/image";

const HairRegrowCard = () => {
  return (
    <div className="flex flex-col justify-center items-center bg-[#729693] min-h-screen p-6 space-y-8">
      {/* First Section */}
      <div className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-lg">
        <Image
          src="/images/Regrow_Hair.webp"
          alt="Regrow Hair"
          width={400}
          height={300}
          className="rounded-lg"
        />
        <div className="absolute top-6 left-6 text-white font-semibold text-lg max-w-[60%]">
          <p>Regrow hair in</p>
          <p>3–6 months with</p>
          <p className="font-bold">Minoxidil</p>
        </div>
        <button className="absolute bottom-6 right-6 bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md">
          Get started
        </button>
      </div>

      {/* Second Section */}
      <div className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md p-6 shadow-lg">
        <Image
          src="/images/hair_goals.webp"
          alt="Hair Goals"
          width={400}
          height={300}
          className="rounded-lg"
        />
        <div className="absolute top-6 left-6 text-white font-semibold text-lg">
          <p>What are your</p>
          <p>hair goals?</p>
        </div>

        {/* Buttons */}
        <div className="absolute bottom-6 left-6 space-y-2">
          <button className="bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md w-full">
            Stop thinning or shedding
          </button>
          <button className="bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md w-full">
            Regrow thicker, fuller hair
          </button>
          <button className="bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md w-full">
            All the above
          </button>
        </div>
      </div>
    </div>
  );
};

export default HairRegrowCard;
