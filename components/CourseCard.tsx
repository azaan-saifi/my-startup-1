import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CourseCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  className?: string;
}

const CourseCard = ({
  title,
  description,
  imageUrl,
  className,
}: CourseCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-6">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/60 opacity-80" />
      </div>

      <h3 className="text-2xl font-medium tracking-tight line-clamp-2 text-white mb-2">
        {title}
      </h3>
      <p className="text-base text-zinc-400 line-clamp-2">{description}</p>
    </div>
  );
};

export default CourseCard;
