import { Landmark } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({ light = false }) => {
  return (
    <Link
      to="/"
      className="flex w-fit items-center gap-3"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          light
            ? "bg-white text-slate-950"
            : "bg-slate-950 text-white"
        }`}
      >
        <Landmark size={20} />
      </div>

      <span
        className={`text-xl font-bold tracking-tight ${
          light ? "text-white" : "text-slate-950"
        }`}
      >
        Finova
      </span>
    </Link>
  );
};

export default Logo;